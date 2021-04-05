//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const e = require("express");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "todo list 1"
});


const item2 = new Item({
  name: "todo list 2"
});


const item3 = new Item({
  name: "todo list 3"
});

const itemArr = [item1, item2, item3];

const itemListSchema = {
  name: String,
  listItems : [itemsSchema]
};

const ItemList = mongoose.model('List', itemListSchema);


app.get("/", function(req, res) {


// const day = date.getDate();


  Item.find({} , function(err, itemList){

    if(itemList.length === 0){
      Item.insertMany(itemArr, function(err) {
        if(err){
          console.log(err);
        }else {
          console.log("Successfully added item");
        }
      })
      res.redirect('/');      
    }else{

    res.render("list", {listTitle: "Today", newListItems: itemList});
  }
});


});

app.post("/", function(req, res){

  var item = new Item({
    name : req.body.newItem
  });

  console.log(req.body.list);

  if(req.body.list === 'Today'){
    item.save();
    res.redirect("/");
  } else{
    ItemList.findOne({name:req.body.list}, function(err, iList){
      iList.listItems.push(item);
      iList.save();
      res.redirect('/' + req.body.list);
      
    });
  }

  
});

app.post('/delete', function(req, res){
  const itemId = req.body.checkbox;
  Item.findByIdAndDelete(itemId, function(err){
    if(err){
      console.log("error occured while deleting item : " + err);
    }else {
      console.log("Deleted item successfully");
    }
    res.redirect("/");
  });
});

app.get("/:route", function(req,res){
  
  const listName = req.params.route;

  ItemList.findOne({name: listName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new ItemList({
          name: listName,
          listItems : itemArr
        });
      
        list.save();
        res.redirect('/' + listName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.listItems});
      }
    }
  })

  

  // console.log(l)
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
