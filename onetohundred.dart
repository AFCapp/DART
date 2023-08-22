// "FizzBuzz: Write a program that prints the numbers "
// "from 1 to 100. But for multiples of three, print Fizz"
//  "instead of the number, and for the multiples of five,
//  "print "Buzz". For numbers which are multiples of both"
//  "three and five, print FizzBuzz"

void main() {
  fizBuz(1, 100);
}

fizBuz(int num1, int num2) {
  for (int i = num1; i <= num2; i++) {
    if (i % 3 == 0 && i % 5 == 0) {
      print("FizzBuzz");
    } else if (i % 3 == 0) {
      print("Fizz");
    } else if (i % 5 == 0) {
      print("Buzz");
    } else {
      print(i);
    }
  }
}
