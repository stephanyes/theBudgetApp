//BUDGET CONTROLLER
var budgetController = (function() {
  //Function constructors van con mayuscula para identificarlo mejor
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(element => {
      sum += element.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1 //para que no afecte cuando no tenemos valores y muestre un porcentaje erroneo
  };

  return {
    addItem: function(type, desc, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }
      //Depending on which TYPE we are getting when we push NEW ITEM to data.allItems it will go either to EXP or INC.
      data.allItems[type].push(newItem);
      // Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      // Loop over all the elemts
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // 1. Calcukate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // 2. Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // 3. Calcuilate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      /*
      Expenses
      a=20
      b=10
      c=40
      income = 100
      a=20/100=20%
      b=10/100=10%
      c=40/100=40%
      */

      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentageLabel: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };

  //--------------------------------------------------
})();

//UI CONTROLLER
var UIController = (function() {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeValue: ".budget__income--value",
    expenseValue: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  //Manipulating Strings with this function
  var formatNumber = function(numToFormat, type) {
    /*
    + or - before number,
    exactly 2 decimal points,
    comma separating the thousands
    */
    var numSplit, int, dec, type;
    numToFormat = Math.abs(numToFormat);
    numToFormat = numToFormat.toFixed(2); //toFixed is a function that will give us the total decimals we want to show, in this case just 2 after the . -> 150.22
    numSplit = numToFormat.split(".");
    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); //input 2310, output 2,310
    }
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  //first class functions
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        //Devolvemos un objeto para instanciarlo mejor
        type: document.querySelector(DOMStrings.inputType).value, //Esto va a ser INC or EXP
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value) //Lo parseamos por que no podemos operar con STRINGS
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text

      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i> </button> </div> </div> </div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((current, index, array) => {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeValue).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expenseValue
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentageLabel > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentageLabel + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel); //This returns a node list

      //The percentage next to each expense
      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changeType: function() {
      //fields is returning a NODE list
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function(current) {
        current.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputButton).classList.toggle("red");
    },
    getDOMstrings: function() {
      return DOMStrings;
    }
  };
})();

//GLOBAL APP CONTROLLER   ------>>>>>>>> Este controller va a unir el UIController y el budgetController
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();
    //El keypress lo ponemos en toda la web, no solo al button submit
    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(e) {
      //Code
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };
  var updateBudget = function() {
    //1. Calculate the budget
    budgetController.calculateBudget();
    //2. Method to return budget
    var totalBudget = budgetController.getBudget();
    //3. Display the budget on the ui
    UIController.displayBudget(totalBudget);
  };

  var updatePercentages = function() {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3. Update UI
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    //1. Get the field input ddata
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to the budget controller
      newItem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );

      //3. add the new item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();

      // 6. calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemId, splitId, type, ID;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      //inc-1
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. delete the item from the UI
      UICtrl.deleteListItem(itemId);
      // 3. Update and show new budget
      updateBudget();
      // 4. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Application has started.");
      UICtrl.displayMonth();
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentageLabel: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
