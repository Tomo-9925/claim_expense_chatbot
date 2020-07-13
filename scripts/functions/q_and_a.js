//Q and A function
var list = new Array();

list.push(new ListItem('ボールペン','雑費',true,));
list.push(new ListItem('電車賃','交通費',true));
list.push(new ListItem('昼食代','食費',false));
list.push(new ListItem('ランチ','食費',false));
list.push(new ListItem('夕食費','食費',false));
list.push(new ListItem('PC代','雑費',false));
list.push(new ListItem('朝食代','食費',false));
list.push(new ListItem('飛行機代','交通費',true));
list.push(new ListItem('新幹線代','交通費',true));
list.push(new ListItem('印鑑代','雑費',true));
list.push(new ListItem('接待費','接待費',false));
list.push(new ListItem('電気代','光熱費',false));

function ListItem(_thing, _item, _yesno){
  var self = this;
  self.thing = _thing;  //物品名(string)
  self.item = _item;    //項目（交通費、雑費など）(string)
  self.YN = _yesno;     //可否(true:yes false:no)(boolean)
  //self.ID2 = _userID2;  //申請者ID(int)
}

function isExpensable(name){
  for (var i = 0; i < list.length; i++) {
    if ((list[i].thing == name) && (list[i].YN == true)){
      var item = list[i].item;
      return true;
    } else if((list[i].thing == name) && (list[i].YN == false)){ //○○が経費で落とせない場合
      return false;
    }
  }
  return undefined;
}
exports.isExpensable = isExpensable;

function addItem(thing, item, yesno) {
  list.push(new ListItem(thing, item, yesno));
}
exports.addItem = addItem;