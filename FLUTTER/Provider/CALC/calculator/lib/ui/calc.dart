// import 'package:calculator/constants/colors.dart';
// import 'package:calculator/ui/widget/buttons.dart';
// import 'package:calculator/ui/widget/customtextfield.dart';
// import 'package:flutter/material.dart';

// class CalculatorApp extends StatelessWidget {
//   const CalculatorApp({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         backgroundColor: Colors.black,
//         title: const Text("Calculator"),
//         centerTitle: true,
//       ),
//       body: Column(
//         children: [
//           const CustomTextField(),
//           Container(
//               height: MediaQuery.sizeOf(context).height * 0.64,
//               width: double.infinity,
//               padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 12),
//               decoration: const BoxDecoration(
//                 color: AppColors.primaryclr,
//                 borderRadius: BorderRadius.vertical(top: Radius.circular(10)),
//               ),
//               child: Column(
//                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                 children: [
//                   Row(
//                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                     children: List.generate(4, (index) => buttonList[index]),
//                   ),
//                   Row(
//                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                     children:
//                         List.generate(4, (index) => buttonList[index + 4]),
//                   ),
//                   Row(
//                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                     children:
//                         List.generate(4, (index) => buttonList[index + 8]),
//                   ),
//                   Row(
//                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                     children:
//                         List.generate(4, (index) => buttonList[index + 12]),
//                   ),
//                   Row(
//                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                     children:
//                         List.generate(4, (index) => buttonList[index + 16]),
//                   ),
//                   // Row(
//                   //   mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                   //   children:
//                   //       List.generate(4, (index) => buttonList[index + 18]),
//                   // ),
//                 ],
//               ))
//         ],
//       ),
//     );
//   }
// }

// List<Widget> buttonList = [
//   const Button1(
//     label: "C",
//     textColor: Colors.blue,
//   ),
//   const Button1(
//     label: "/",
//     textColor: Colors.blue,
//   ),
//   const Button1(
//     label: "X",
//     textColor: Colors.blue,
//   ),
//   const Button1(
//     label: "AC",
//     textColor: AppColors.secondclr,
//   ),
//   const Button1(
//     label: "7",
//   ),
//   const Button1(
//     label: "8",
//   ),
//   const Button1(
//     label: "9",
//   ),
//   const Button1(
//     label: "+",
//     textColor: Color.fromARGB(255, 33, 172, 5),
//   ),
//   const Button1(
//     label: "5",
//   ),
//   const Button1(
//     label: "6",
//   ),
//   const Button1(
//     label: "-",
//   ),
//   const Button1(
//     label: "1",
//   ),
//   const Button1(
//     label: "2",
//   ),
//   const Button1(
//     label: "3",
//   ),
//   const Button1(
//     label: "%",
//   ),
//   const Button1(
//     label: "0",
//   ),
//   // const Button1(
//   //   label: ".",
//   // ),
//   // const Button1(
//   //   label: "",
//   // ),
// ];
