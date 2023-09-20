import 'package:dice_roller/logic/dice_logic.dart';
import 'package:flutter/material.dart';

class DiceUi extends StatelessWidget {
  const DiceUi({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text(
          "Dice Rollers",
          style: TextStyle(color: Colors.white),
        ),
        centerTitle: true,
        backgroundColor: const Color.fromARGB(255, 32, 196, 218),
      ),
      body: const Center(child: DiceLogic()),
    );
  }
}
