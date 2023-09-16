// Palindrome Checker: Create a program that
// checks whether a given string is a palindrome
// or not. A palindrome is a word, phrase, number,
// or other sequences of characters that reads the
// same forward and backward (ignoring spaces, punctuation
// , and capitalization).

void main() {
  palindrome("eye");
}

List<String> palimstore = [];
void palindrome(String s) {
  // int stringLength = s.length;
  for (int i = 2; i >= 0; i--) {
    print(s[i]);
    palimstore.add(s[i]);
  }
  palimstore = palimstore.join("");
  print(palimstore);
}
