import 'package:flutter/material.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.green,
          title: const Text('Instagram'),
        ),
        body:  Column(
          children: [
            Flexible(
              child: Container(
                //color: Colors.blueGrey,
                child: ListView.builder(
                  
                  scrollDirection: Axis.horizontal,
                  itemCount: 30,
                  itemBuilder: (context, index) {
                    return CircleAvatar(
                      backgroundColor: Colors.blueGrey,
                    );
                  },
                ),
              ),
            ),
            Flexible(
              child: Container(
                color: Colors.lightGreen,
                child: ListView.builder(
                    itemCount: 30,
                    itemBuilder: (_, i) => Container(
                          height: 22,
                          width: 33,
                          color: Colors.blue,
                        )),
              ),
            ),
          ],
        ));
  }
}
