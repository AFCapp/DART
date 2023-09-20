import 'package:api_learn/api/fetch_posts.dart';
import 'package:api_learn/api/model/model_post.dart';
import 'package:flutter/material.dart';

class SomePost extends StatefulWidget {
  const SomePost({Key? key}) : super(key: key);

  @override
  State<SomePost> createState() => _SomePostState();
}

class _SomePostState extends State<SomePost> {
  List<PostResponse> posts = [];
  @override
  void initState() {
    getPost();
    super.initState();
  }

  getPost() async {
    final postTemp = await fetchPosts();
    posts = postTemp;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
          child: ListView.builder(
              itemCount: posts.length,
              itemBuilder: (context, index) {
                return Text(posts[index].body);
              })),
    );
  }
}
