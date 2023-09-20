void main() {
  reverse("Hello,World!");
}

List<String> a = [];
reverse(s) {
  int ss = s.length;
  for (int i = ss - 1; i >= 0; i--) {
  
    a.add(s[i]);
  }
  String oo = a.join("");
  print(oo);
}
