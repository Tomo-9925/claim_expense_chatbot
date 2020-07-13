var list = new Array();
init();

function init(){
    //addItem("567333","ホッチキス","消耗品");
}

//addItem
//リストに申請待機中の申請を追加する．
//roomID:   申請された部屋のroomID
//userName: ユーザー名
//name:     物品名
//type:     項目名
function addItem(roomID, userName, name, type, amount, photos){
    var item = new registrationItem(roomID, userName, name, type, amount, photos, Date.now());
    list.push(item);
    console.log("a item added.");
    showAll();
}
exports.addItem = addItem;

//登録待機リストから，引数で与えられた物品に当てはまるものを申請していたユーザーのroomIDを取得する．
function getRoomIDsByItemName(name){
    var users = new Array();
    for(var i = 0; i < list.length; i++){
        if (list[i].itemName == name){
            users.push(list[i].roomID);
        }
    }
    console.log(users);
    return users;
}
exports.getRoomIDsByItemName = getRoomIDsByItemName;

//登録完了リストから，引数で与えられた物品に当てはまるアイテムの配列を返す．
function getItemsByItemName(name){
    var items = new Array();
    for(var i = 0; i < list.length; i++){
        if (list[i].itemName == name){
            items.push(list[i]);
        }
    }
    console.log(items);
    return items;
}
exports.getItemsByItemName = getItemsByItemName;

//登録完了リストから，引数で与えられた日を含む月に一致するアイテムの配列を返す．
function getItemsByDate(targetDate){
    var items = new Array();
    console.log("-----" + targetDate.getFullYear() + "年" + targetDate.getMonth() + "月-----")
    for(var i = 0; i < list.length; i++){
        var date = new Date(list[i].registrationDate);
        console.log("Item:" + list[i].itemName + date.getFullYear() + "年" + date.getMonth() + "月   targetDate = " + targetDate.getMonth());
        if(date.getMonth() == targetDate.getMonth()/*&& date.getFullYear() === targetDate.getFullYear()*/){
            items.push(list[i]);
            console.log("push");
        }
    }
    console.log(items);
    return items;
}
exports.getItemsByDate = getItemsByDate;

//eliminateItemByName
//引数で与えられた物品と一致する申請をすべて削除する．
//name:     物品名
const eliminateItemByName = function(name){
    let index = -1;
    do{
        index = list.findIndex(function(element){
            return element.itemName == name;
        });
        console.log(name + "matched to " + index );
        if(index > -1){
            list.splice(index, 1);
            showAll();
        }
    }while(index > -1);
}
exports.eliminateItemByName = eliminateItemByName;

//すべての要素をコンソールに出力
function showAll(){
    for(i = 0; i < list.length; i++){
        console.log(list[i].roomID + "," + list[i].userName + "," + list[i].itemName + "," + list[i].type + "," + list[i].amount + "," + list[i].photos + "," + list[i].registrationDate)
    }
}
exports.showAll = showAll;

function registrationItem(_roomID, _userName, _name, _type, _amount, _photos, _date){
    var self = this;
    self.roomID = _roomID;//roomID
    self.userName = _userName; //申請者ID
    self.itemName = _name;//物品名
    self.type = _type;//項目
    self.amount = _amount;//金額
    self.photos = _photos;//写真URLの配列
    self.registrationDate = _date;//登録日時
}
