var BudgetController = (function() {
  // for creating new instanse
  var Expenses = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.precentage = -1;
  };
  Expenses.prototype.CalcPrecentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.precentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.precentage = -1;
    }
  };
  Expenses.prototype.GetPrecentage = function() {
    return this.precentage;
  };

  var Incomes = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var CalculateSum = function(type) {
    sum = 0;
    data.allItem[type].forEach(function(cur, index, arr) {
      sum += cur.value;
    });
    data.total[type] = sum;
  };
  var data = {
    allItem: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    precentage: -1
  };
  return {
    AddItem: function(type, des, val) {
      var newItem, ID;

      if (data.allItem[type].length > 0) {
        ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
      } else {
        ID = 0; // id will give you an error
      }

      // create new item base on 'inc' or 'exp'
      if (type === "exp") {
        newItem = new Expenses(ID, des, val);
      } else if (type === "inc") {
        newItem = new Incomes(ID, des, val);
      }

      data.allItem[type].push(newItem);
      return newItem;
    },
    testing: function() {
      console.log(data);
    },
    CalculateBudget: function() {
      // calculate total incomes and expenses
      CalculateSum("exp");
      CalculateSum("inc");

      //calculate budget
      data.budget = data.total.inc - data.total.exp;

      //calculate precentage of income
      if (data.total.inc > 0) {
        data.precentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.precentage = -1;
      }
    },
    calculatePrecentage: function() {
      data.allItem.exp.forEach(function(cur, index, arr) {
        cur.CalcPrecentage(data.total.inc);
      });
    },
    getPrecentage: function() {
      allPrec = data.allItem.exp.map(function(cur, index, arr) {
        return cur.GetPrecentage();
      });
      return allPrec;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        precentage: data.precentage,
        totalInc: data.total.inc,
        totalExp: data.total.exp
      };
    },
    deleteItem: function(id, type) {
      var index, ids;
      // id = 6
      //ids =[1,2,4,6,8]
      // index = 3
      ids = data.allItem[type].map(function(cur) {
        return cur.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItem[type].splice(index, 1);
      }
    }
  };
})();

//UI controller
var UIController = (function() {
  var DomString = {
    type: ".add__type",
    value: ".add__value",
    description: ".add__description",
    add: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    precentageLabel: ".budget__expenses--percentage",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    container: ".container",
    itemPrec: ".item__percentage",
    time: ".budget__title--month"
  };
  var formatNum = function(num, type) {
    var numSplit,
      int,
      dec,
      num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    return (type === "exp" ? "-  " : "+ ") + int + "." + dec;
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(DomString.type).value,
        description: document.querySelector(DomString.description).value,
        value: parseFloat(document.querySelector(DomString.value).value)
      };
    },
    getDomString: function() {
      return DomString;
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;

      // create html string with placeholder text
      if (type === "inc") {
        element = DomString.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DomString.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace the text placeholder to a\ctuall data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNum(obj.value, type));

      // inster the html to the Dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteItemList: function(itemId) {
      var el = document.getElementById(itemId);
      el.parentNode.removeChild(el);
    },
    clearField: function() {
      var fields, newArray;
      fields = document.querySelectorAll(
        DomString.description + " , " + DomString.value
      );
      // solution is to convert the list to array
      newArray = Array.prototype.slice.call(fields);
      newArray.forEach(function(cur, index, arr) {
        cur.value = "";
      });
      newArray[0].focus();
    },
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DomString.budgetLabel).textContent = formatNum(
        obj.budget,
        type
      );
      document.querySelector(DomString.incomeLabel).textContent = formatNum(
        obj.totalInc,
        type
      );
      document.querySelector(DomString.expenseLabel).textContent = formatNum(
        obj.totalExp,
        type
      );

      if (obj.precentage > 0) {
        document.querySelector(DomString.precentageLabel).textContent =
          obj.precentage + "%";
      } else {
        document.querySelector(DomString.precentageLabel).textContent = "---";
      }
    },
    displayPrecentage: function(precentage) {
      var fields = document.querySelectorAll(DomString.itemPrec);

      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(cur, index) {
        if (precentage[index] > 0) {
          cur.textContent = precentage[index] + "%";
        } else {
          cur.textContent = "---";
        }
      });
    },
    displayMonth: function() {
      var now, year, month, day;
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      day = now.getDay();
      document.querySelector(DomString.time).textContent =
        day + "/" + month + "/" + year;
    }
  };
})();

// controlller
var Controller = (function(UICtrl, BudgetCtrl) {
  var setUpEventListner = function() {
    var dom = UICtrl.getDomString();

    document.querySelector(dom.add).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(dom.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function() {
    var budget;
    //Calculate the budget
    BudgetCtrl.CalculateBudget();

    //Return the budget
    budget = BudgetCtrl.getBudget();

    //Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePrecentage = function() {
    var precentages;

    //calculate the precentages
    BudgetCtrl.calculatePrecentage();

    //Read precentages from BudgetController
    precentages = BudgetCtrl.getPrecentage();

    UICtrl.displayPrecentage(precentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    // get the input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //add the item to the budget controller
      newItem = BudgetCtrl.AddItem(input.type, input.description, input.value);

      // add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //clear fields
      UICtrl.clearField();

      //update the budget
      updateBudget();

      //calculate and update precentages
      updatePrecentage();
    }
  };
  var ctrlDeleteItem = function(event) {
    var itemId, splitId, type, ID;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);

      //Delete the item from the data
      BudgetCtrl.deleteItem(ID, type);

      // delete the item from the UI
      UICtrl.deleteItemList(itemId);

      // update and show the new budget
      updateBudget();

      //calculate and update precentages
      updatePrecentage();
    }
  };
  return {
    init: function() {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        precentage: -1,
        totalInc: 0,
        totalExp: 0
      });
      console.log("application has started");
      setUpEventListner();
    }
  };
})(UIController, BudgetController);

Controller.init();
