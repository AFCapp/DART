import 'package:custom_widgets/buttons/mainbuttons.dart';
import 'package:flutter/material.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text("hello"),
          centerTitle: true,
          backgroundColor: Colors.green,
        ),
        body: Center(
            child:
                MainButtons(onclick: nextFunction, text: const Text("Next"))));
  }

  nextFunction() {
    Navigator.pushNamed(context, "/buttons");
  }
}
