import 'package:api_learn/api/model/model_post.dart';
import 'package:http/http.dart' as http;

Future<List<PostResponse>> fetchPosts() async {
  var client = http.Client();
  final response =
      await client.get(Uri.parse("https://jsonplaceholder.typicode.com/posts"));
  if (response.statusCode == 200) {
    List<PostResponse> posts = postResponseFromJson(response.body);
    print(posts);
    return posts;
  } else {
    return [];
  }
}
