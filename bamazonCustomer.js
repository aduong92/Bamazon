var mysql = require("mysql");
var inquirer = require("inquirer");

function formatDollar(num) {
  var p = num.toFixed(2).split(".");
  return "$" + p[0].split("").reverse().reduce(function (acc, num, i, orig) {
    return num == "-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
  }, "") + "." + p[1];
}

var connection = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon',
  }
);

connection.connect(function (err) {
  if (err) throw err;
  showItems()
});

function showItems() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log("Item ID: " + res[i].item_id + "\n" +
        "Product Name: " + res[i].product_name + "\n" +
        "Department: " + res[i].department_name + "\n" +
        "Price: " + formatDollar(res[i].price) + "\n" +
        "Stock Quantity: " + res[i].stock_quantity);
      console.log("------------------------------------------");
    }
    buyItem();
  });

};

var buyItem = function () {
  inquirer.prompt([{
    name: "itemId",
    type: "input",
    message: "Please enter the product ID you want to purchase"
  }, {
    name: "quantity",
    type: "input",
    message: "How many units would you like to purchase?"
  }]).then(function (answer) {

    connection.query("SELECT * FROM products", function (err, res) {
      if (err) throw err;

      var chosenItem;
      for (var i = 0; i < res.length; i++) {
        if (res[i].item_id === parseInt(answer.itemId)) {
          chosenItem = res[i];
        }
      }

      if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: (chosenItem.stock_quantity - parseInt(answer.quantity))
            },
            {
              item_id: chosenItem.item_id
            }
          ],
          function (error) {
            if (error) throw error;
            console.log("Your total is " + formatDollar(answer.quantity * chosenItem.price));
          }
        );
      }
      else {
        console.log("Sorry insufficient quantity!");
      }
    });
  });
};
