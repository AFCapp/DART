import yaml from "js-yaml";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { BsInfoCircle } from "react-icons/bs";
import Spacer from "react-spacer";
import ReactTooltip from "react-tooltip";
import AnimatedLoader from "../../components/AnimatedLoading";
import CustomButton from "../../components/Button";
import Checkbox from "../../components/CheckBox";
import CustomAlert from "../../components/CustomAlert";
import CustomDropDown from "../../components/CustomDropDown";
import Header1 from "../../components/Header1";
import LinkText from "../../components/LinkText";
import SubHeader from "../../components/SubHeader";
import TextInput from "../../components/TextInput";
import ToolTip from "../../components/ToolTip";
import TooltipWrapper from "../../components/TooltipWrapper";
import Warning from "../../components/Warning";

import WarningErrorCTA from "../../components/WarningErrorCTA";
import "../../css/kumo.css";
import batchPrediction from "../../models/BatchPredictionModel";
import batchPredictionService from "../../services/batch_prediction_service";
import connectorService from "../../services/connector_service";
import queryService from "../../services/query_service";
import {
    handleError,
    parseErrorMessage,
    showBanner
} from "../../utils/ErrorHandler";
import {
    artifactType,
    ctaLevels,
    digitsRegex,
    floatRegex,
    integratedWarehouseConnector,
    jobStatus,
    navRoutes,
    outputStorage,
    queryTaskType,
    storageKeys,
    warehouseSource
} from "../../utils/constants";
import { getCta } from "../../utils/ctaFunctions";
import {
    enableBpFilters,
    enableDemoFeatures,
    enablePrivatePreview,
    getCtaColor,
    getCtaSeverity,
    hasIntegratedWarehouse,
    isValid,
    removeFromSessionStorage
} from "../../utils/helpers";
import withNavigation from "../../utils/navigator";

/**
 * NewBatchPrediction Component
 *
 * UI to render fields for creating new new batch prediction component
 *
 */
class NewBatchPrediction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bpErrWarnMsgs: {},
            invalidConfig: false,
            inValidQuery: false,
            loading: true,
            showAlert: false,
            errorMsg: {},
            connectors: [],
            unProcessableEntityError: {},
            showError: false,
            isConnectorEmpty: false
        };

        this.onRunPredictionClick = this.onRunPredictionClick.bind(this);
        this.onQuerySelect = this.onQuerySelect.bind(this);
        this.onArtifactsChange = this.onArtifactsChange.bind(this);
        this.onSelectStorage = this.onSelectStorage.bind(this);
        this.onThresholdChange = this.onThresholdChange.bind(this);
        this.onSelectConnector = this.onSelectConnector.bind(this);
        this.restartValidation = this.restartValidation.bind(this);
        this.gotoPage = this.gotoPage.bind(this);
        this.onAlertClose = this.onAlertClose.bind(this);
        this.onErrorCloseClick = this.onErrorCloseClick.bind(this);

        this.validateTimerID = null;
    }

    componentDidMount() {
        this.getQueries();
        this.getConnectorsList();
    }

    componentWillUnmount() {
        clearTimeout(this.validateTimerID);
        batchPrediction.initialize();
    }

    restartValidation() {
        // Reset existing timer
        clearTimeout(this.validateTimerID);

        // Start a timer to run the validation method in a second
        const seconds = 1;
        this.validateTimerID = setTimeout(
            () => this.validateOutputs(),
            seconds * 1000
        );
    }

    onSelectConnector() {
        this.setState({ isConnectorEmpty: false });
        this.restartValidation();
    }

    onSelectStorage(e) {
        batchPrediction.storage_type = e.value;
        batchPrediction.outputs = {};
        batchPrediction.initializeOutputs(artifactType.Predictions);
        if (
            batchPrediction.storage_type === outputStorage.Snowflake &&
            hasIntegratedWarehouse()
        ) {
            batchPrediction.connector = integratedWarehouseConnector;
        } else {
            batchPrediction.connector = "";
        }
        this.setState({});
    }

    onUpdateNumWorkers(e) {
        batchPrediction.numParallelWorkersLimit = e.value;
    }

    getConnectorsList() {
        let tmpArray = [];
        connectorService
            .getAllConnectors()
            .then((response) => {
                if (response.data) {
                    for (let i = 0; i < response.data.length; i++) {
                        let data = response.data[i];
                        if (data.config.type !== warehouseSource.SnowFlake) {
                            continue;
                        }
                        let connector = {};
                        connector.value = data.id;
                        connector.label = data.id;

                        tmpArray.push(connector);
                    }
                }
                this.setState({
                    connectors: tmpArray
                });
            })
            .catch((error) => {});
    }

    /**
     *  This method invokes REST API call and fetches all the predictive queries
     *  and sets it to global object.
     */
    getQueries() {
        queryService
            .getAllQueries()
            .then((response) => {
                if (response.data) {
                    let tmpArray = [];
                    let successfulQueries = 0;
                    let queryIndex = -1;
                    for (let i = 0; i < response.data.length; i++) {
                        let data = response.data[i];
                        let query = {};
                        let status = data.training_job.status;
                        let label = data.id;
                        if (status !== jobStatus.Done) {
                            label += " (" + status + ")";
                        } else {
                            queryIndex = i;
                            successfulQueries += 1;
                        }
                        query.value = data.id;
                        query.label = label;
                        query.task_type = isValid(data.task_type)
                            ? data.task_type
                            : "";
                        query.status = status;
                        query.callToActions = [];
                        if (data.call_to_actions !== undefined) {
                            query.callToActions = data.call_to_actions;
                            if (query.callToActions.length > 0) {
                                query.ctaSeverity = getCtaSeverity(
                                    query.callToActions
                                );
                            }
                        }
                        tmpArray.push(query);
                    }
                    batchPrediction.predictiveQueries = tmpArray;
                    this.setState({
                        loading: false
                    });
                    if (successfulQueries === 1) {
                        this.onQuerySelect(tmpArray[queryIndex]);
                    }
                } else {
                    this.setState({
                        loading: false
                    });
                }
            })
            .catch((error) => {
                handleError(this, error);
            });
    }

    /**
     * This method invokes REST API call to validate batch prediction
     * output storage and artifacts
     *
     * @returns int 0: Success, 1:Failure
     */
    async validateOutputs() {
        batchPrediction.storageArtifactError = "";
        let outputList = Object.keys(batchPrediction.outputs);
        outputList.forEach((element, index) => {
            batchPrediction.outputs[element].errorInfo = {};
        });
        return batchPredictionService
            .validateBatchPredictions()
            .then((response) => {
                if (response.data.output_errors) {
                    let valid = true;
                    response.data.output_errors.forEach((element, index) => {
                        if (element && element.message) {
                            valid = false;
                            let err = {
                                color: getCtaColor(element.level),
                                info: element.message
                            };
                            let artifact = outputList[index];

                            batchPrediction.outputs[artifact].errorInfo = err;
                        }
                    });
                    const pqueryErrors = (
                        response.data.pquery_validation?.errors || []
                    )
                        .filter((e) => e?.message)
                        .map((element) => {
                            return {
                                cta: {},
                                description: element.message,
                                is_dismissible: false,
                                is_error: true,
                                title: element.title
                            };
                        });
                    if (pqueryErrors.length > 0) {
                        valid = false;
                    }
                    this.setState({
                        bpErrWarnMsgs: {
                            ...this.state.bpErrWarnMsgs,
                            errors: pqueryErrors,
                            showCTAErrors: true
                        }
                    });
                    return valid ? 0 : 1;
                }
                return 0;
            })
            .catch((error) => {
                batchPrediction.storageArtifactError = parseErrorMessage(error);
                this.setState({});
                return 1;
            });
    }

    async onRunPredictionClick() {
        if (this.state.inValidQuery) {
            this.setState({ showAlert: true });
            return;
        }
        let validConfigs = batchPrediction.valideConfigs();
        if (!validConfigs) {
            this.setState({ invalidConfig: true });
            return;
        }
        if (
            batchPrediction.storage_type === outputStorage.Snowflake &&
            !isValid(batchPrediction.connector)
        ) {
            this.setState({ isConnectorEmpty: true });
            return;
        }
        this.setState({ loading: true });
        let status = await this.validateOutputs();
        if (status === 1) {
            let isError = false;
            let err = "";
            for (var key in batchPrediction.outputs) {
                if (batchPrediction.outputs[key]?.errorInfo?.info) {
                    err = key + " - "; //Adding artifact name
                    err += batchPrediction.outputs[key].errorInfo.info + "\n";
                }
                if (
                    batchPrediction.outputs[key]?.errorInfo?.color ===
                    ctaLevels.Critical.color
                ) {
                    isError = true;
                }
            }
            if (isError) {
                if (!err && batchPrediction.storageArtifactError) {
                    err = batchPrediction.storageArtifactError;
                }
                let errorInfo = {
                    "title": "Error in output storage artifacts!",
                    "description": "Error: \n" + err
                };
                showBanner(this, err, errorInfo.title);
                return;
            }
        }
        batchPredictionService
            .createBatchPrediction()
            .then((response) => {
                if (response.data) {
                    this.setState({ loading: false });
                    let id = response.data.id;
                    removeFromSessionStorage(storageKeys.batchPrediction);
                    batchPrediction.initialize();
                    this.props.navigate(navRoutes.PredictionStatus + id, {
                        replace: true
                    });
                } else {
                    this.setState({
                        loading: false
                    });
                }
            })
            .catch((error) => {
                handleError(this, error);
            });
    }

    onQuerySelect(e) {
        batchPrediction.selectedQuery = e;
        batchPrediction.prediction_type = e.task_type;
        if (e.status !== jobStatus.Done) {
            let errorInfo = {};
            if (e.status === jobStatus.Failed) {
                errorInfo = {
                    "title": "Failed Predictive Query!",
                    "description":
                        "The selected Predictive Query has failed to train," +
                        " so Batch Prediction is not possible"
                };
            } else {
                errorInfo = {
                    "title": "Training not finished!",
                    "description":
                        "The selected Predictive Query has not finished " +
                        "training. \nPlease wait for the training job to finish before " +
                        "performing Batch Prediction."
                };
            }
            this.setState({
                inValidQuery: true,
                errorMsg: errorInfo,
                bpErrWarnMsgs: {}
            });
            return;
        }

        batchPrediction.selectedQueryId = e.value;
        batchPrediction.storage_type = outputStorage.S3; //Default output storage
        batchPrediction.outputs = {};
        batchPrediction.initializeOutputs(artifactType.Predictions);
        //Get Warnings if any, for the selected PQuery.
        this.getPQueryWarnings(batchPrediction.selectedQueryId);
        this.getPQuery(batchPrediction.selectedQueryId).then(() => {
            // getPquery updates the global batchPrediction so we want to trigger
            // a refresh only after that's done
            this.setState({ inValidQuery: false, errorMsg: {} });
        });
    }

    onArtifactsChange(e) {
        if (batchPrediction.outputs[e.target.id]) {
            delete batchPrediction.outputs[e.target.id];
        } else {
            batchPrediction.initializeOutputs(e.target.id);
        }
        this.setState({});
    }

    onThresholdChange(e) {
        if (e.target.value === "" || floatRegex.test(e.target.value)) {
            let value = e.target.value;
            if (value.split(".").length > 1) {
                if (value.split(".")[1].length > 2) {
                    value = e.target.value.substring(0, 4);
                }
            }
            batchPrediction.binary_classifications.threshold = value;
            this.setState({});
        }
    }

    onAlertClose() {
        this.setState({ showAlert: !this.state.showAlert });
    }

    onErrorCloseClick() {
        this.setState({ showError: !this.state.showError });
    }

    gotoPage(path) {
        this.props.navigate(path);
    }

    /**
     *  This method invokes REST API call to fetch warnings/errors for a given
     *  Predictive Query id.
     */
    async getPQueryWarnings(id) {
        let cta = await getCta(
            this,
            id,
            queryService.getQueryWarnings(Array(id)),
            "Predictive Query"
        );
        if (cta && cta[0]) {
            this.setState({
                bpErrWarnMsgs: cta[1]
            });
        }
    }

    /**
     *  This method invokes REST API call to fetch the selected predictive
     *  query
     */
    async getPQuery(id) {
        if (enableBpFilters()) {
            const response = await queryService.getQuery(Array(id));
            if (response.data) {
                if (response.data.config.query_dialect === "YAML") {
                    const queryYaml = yaml.load(
                        response.data.config.query_yaml
                    );
                    batchPrediction.entity_filter_override =
                        queryYaml.entity || "";
                    batchPrediction.temporal_entity_filter_override =
                        queryYaml.temporal_entity_filter || "";
                    batchPrediction.target_filter_override =
                        queryYaml.target || "";
                } else {
                    const queryLines =
                        response.data.config.query_yaml.split("\n");
                    const ENTITY_FILTER_KEY = "ENTITY FILTER IS ";
                    const TEMPORAL_ENTITY_FILTER_KEY =
                        "TEMPORAL ENTITY FILTER IS ";
                    const TARGET_FILTER_KEY = "TARGET FILTER IS ";

                    const extractValue = (key, line) => {
                        return line?.split?.(key)?.[1]?.trim() || "";
                    };

                    // Extract values from each line
                    // TODO: Make this more robust to changes in PQL
                    // P2 since this is an experimental feature
                    queryLines
                        .map((line) => line.trim())
                        .forEach((line) => {
                            // NOTE: Order is important since entity filter
                            // line matches the temporal entity filter line
                            if (line.includes(TEMPORAL_ENTITY_FILTER_KEY)) {
                                batchPrediction.temporal_entity_filter_override =
                                    extractValue(
                                        TEMPORAL_ENTITY_FILTER_KEY,
                                        line
                                    );
                            } else if (line.includes(ENTITY_FILTER_KEY)) {
                                batchPrediction.entity_filter_override =
                                    extractValue(ENTITY_FILTER_KEY, line);
                            } else if (line.includes(TARGET_FILTER_KEY)) {
                                batchPrediction.target_filter_override =
                                    extractValue(TARGET_FILTER_KEY, line);
                            }
                        });
                }
            }
        }
    }

    render() {
        const ctaMsgs = this.state.bpErrWarnMsgs;
        return (
            <>
                {ctaMsgs?.showCTAErrors && ctaMsgs?.errors.length > 0 && (
                    <WarningErrorCTA
                        id={"new-bp-cta-error"}
                        data={ctaMsgs.errors}
                        ctaLevel={ctaLevels.Critical}
                    />
                )}
                {ctaMsgs?.showCTAWarnings && ctaMsgs?.warnings.length > 0 && (
                    <WarningErrorCTA
                        id={"new-bp-cta-warn"}
                        data={ctaMsgs.warnings}
                        ctaLevel={ctaLevels.Warning}
                        handleClose={() => {
                            ctaMsgs.showCTAWarnings = false;
                            this.setState({
                                bpErrWarnMsgs: ctaMsgs
                            });
                        }}
                    />
                )}
                {this.state.unProcessableEntityError?.warnings && (
                    <Warning
                        data={this.state.unProcessableEntityError}
                        error={true}
                        show={this.state.showError}
                        handleClose={this.onErrorCloseClick}
                    />
                )}
                <Row>
                    <Col>
                        <Header1
                            id="new batchprediction"
                            title="Create a Batch Prediction"
                        />
                    </Col>
                    <Col xs md="auto">
                        <span
                            data-tip
                            data-for={"tooltip1"}
                            data-tip-disable={
                                batchPrediction.isValidPredictionQuery() &&
                                batchPrediction.isValidClassNumber()
                            }>
                            <CustomButton
                                id={"runbatchprediction"}
                                title={"Run Batch Prediction"}
                                onClick={this.onRunPredictionClick}
                                className="primary-button"
                                disabled={
                                    !batchPrediction.isValidPredictionQuery() ||
                                    !batchPrediction.isValidClassNumber()
                                }
                            />
                        </span>
                        <ReactTooltip
                            id="tooltip1"
                            place="bottom"
                            className="tooltip-container">
                            <label
                                style={{
                                    width: "auto",
                                    whiteSpace: "pre-line",
                                    maxWidth: 350
                                }}>
                                {this.state.errorMsg.description
                                    ? this.state.errorMsg.description
                                    : !batchPrediction.isValidPredictionQuery()
                                    ? "Please select Predictive Query"
                                    : !batchPrediction.isValidClassNumber() &&
                                      batchPrediction.prediction_type ===
                                          queryTaskType.Classification
                                    ? "Max Categories should be a positive integer."
                                    : !batchPrediction.isValidClassNumber() &&
                                      batchPrediction.prediction_type ===
                                          queryTaskType.LinkPrediction
                                    ? "Predictions per Entity should be a positive integer."
                                    : ""}
                            </label>
                        </ReactTooltip>
                    </Col>
                </Row>
                <Spacer height={10} />
                <div style={{ width: "1.2em", fontSize: "2em", float: "left" }}>
                    <BsInfoCircle size={"0.8em"} color={"grey"} />
                </div>
                <div style={{ height: "auto", overflow: "auto" }}>
                    <span style={{ color: "grey", fontSize: "1em" }}>
                        {
                            "The anchor time of this Batch Prediction (e.g. what a prediction horizon\
                   starting value of zero refers to) is equal to the latest timestamp in the\
                    Fact Table used in your Predictive Query target formula. Note depending\
                     on how up to date your Fact Table is, this may be significantly behind\
                      the current timestamp."
                        }
                    </span>
                </div>
                <Spacer height={15} />
                <Row>
                    <Col md="auto" style={{ paddingTop: 5 }}>
                        <SubHeader
                            title={"Run a Batch Prediction Using"}
                            className="bold-text"
                        />
                    </Col>
                    <Col md="auto">
                        <div style={{ width: "350px" }}>
                            <CustomDropDown
                                id={"select-prediction"}
                                placeholder="Select Query"
                                options={batchPrediction.predictiveQueries}
                                value={batchPrediction.selectedQuery}
                                isSearchable={true}
                                invalid={
                                    this.state.invalidConfig &&
                                    !batchPrediction.isValidPredictionQuery()
                                }
                                onChange={this.onQuerySelect}
                            />
                        </div>
                        {this.state.inValidQuery && (
                            <label
                                className="error-text"
                                style={{
                                    maxWidth: 500,
                                    wordWrap: "break-word",
                                    whiteSpace: "pre-line"
                                }}>
                                {this.state.errorMsg.description}
                            </label>
                        )}
                  
