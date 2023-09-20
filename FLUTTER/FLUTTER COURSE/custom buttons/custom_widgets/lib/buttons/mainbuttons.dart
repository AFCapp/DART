import 'package:flutter/material.dart';

class MainButtons extends StatelessWidget {
  const MainButtons({
    super.key,
    required this.onclick,
    required this.text,
  });
  final VoidCallback onclick;
  final Widget text;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [ElevatedButton(onPressed: onclick, child: text)],
    );
  }
}
