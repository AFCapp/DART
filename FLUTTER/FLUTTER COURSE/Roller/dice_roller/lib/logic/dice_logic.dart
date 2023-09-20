import 'dart:math';

import 'package:flutter/material.dart';

class DiceLogic extends StatefulWidget {
  const DiceLogic({super.key});

  @override
  State<DiceLogic> createState() => _DiceLogicState();
}

class _DiceLogicState extends State<DiceLogic> {
  int current = 1;
  void diceRoller() {
    setState(() {
      current = Random().nextInt(6) + 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Image.asset(
          "images/dice-$current.png",
          width: 100,
        ),
        const SizedBox(
          height: 20,
        ),
        SizedBox(
          width: MediaQuery.sizeOf(context).width / 2.5,
          child: ElevatedButton(
            onPressed: diceRoller,
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color.fromARGB(255, 32, 196, 218),
                textStyle: const TextStyle(color: Colors.black)),
            child: const Text("Turn"),
          ),
        )
      ],
    );
  }
}
