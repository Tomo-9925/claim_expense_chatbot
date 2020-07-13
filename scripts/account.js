"use strict";

// node-cron（一定間隔ごとに処理を発火）
// const cronJob = require('cron').CronJob;

const requestList = require('./functions/registrationRequestList');
const okList = require('./functions/q_and_a');
const expenseList = require('./functions/expenseList');
const waitList = require('./functions/registrationWaitList');

// 経理部のトークルームidを格納
let accountingTalkRoomId = '';

// 相手に送信するメッセージの型
const message = {
  'setAccountingTalkRoomId': "経理部のトークルームを設定しました．",
  'notKeiribu': "ここでは経理部の操作が行なえません．"
}

// 経理部との連絡
module.exports = (robot) => {
  // 経理部のトークルームidを再設定
  robot.respond(/ここが経理部のトークルームです/ui, (res) => {
    accountingTalkRoomId = res.message.room;
    res.send(message.setAccountingTalkRoomId);
  });

  // テストデータの追加
  robot.respond(/data/i, (res) => {
    requestList.addItem('_217226822_2143289344', '岡田 知大', 'スイカ', '食品', ['/var/folders/v0/kdbwkvbd0_79pqknh056tg1w0000gn/T/R0002472.jpg']);
    res.send("データを追加しました．");
  });

  // 登録待機リストの表示
  robot.respond(/登録待機リスト/ui, (res) => {
    if(res.message.room != accountingTalkRoomId) {
      res.send(message.notKeiribu);
      return false;
    }
    let list = waitList.getAllItem();
    for(let i=0; i<list.length; i++) {
      res.send(
        String(i+1) + '. ' + list[i].itemName + "\n" +
        '質問者: ' + list[i].userName
      );
    }
  });

  // 申請待機リストの表示
  robot.respond(/申請待機リスト/ui, (res) => {
    if(res.message.room != accountingTalkRoomId) {
      res.send(message.notKeiribu);
      return false;
    }
    let list = requestList.getAllItem();
    for(let i=0; i<list.length; i++) {
      res.send(
        String(i+1) + '. ' + list[i].itemName + ' / ' + list[i].type + "\n" +
        '申請者: ' + list[i].userName
      );
      res.send({path: list[i].photos})
    }
  });

  // 登録申請待機リストを許可または拒否する
  robot.hear(/^.+を(許可|拒否)する$/ui, (res) => {
    if(res.message.room != accountingTalkRoomId) {
      res.send(message.notKeiribu);
      return false;
    }
    let resMsg = res.match[0];
    let itemName = resMsg.slice(6, -5);
    let waitItems = waitList.getItemsByItemName(itemName);
    let reqItems = requestList.getItemsByItemName(itemName);
    if(reqItems.length==0 && waitItems.length == 0) {
      res.send('該当する品目が見つかりませんでした．')
      return false;
    }
    let permit = resMsg.match(/許可/) ? "許可" : "拒否";
    for(let i=0; i<reqItems.length; i++) {
      if(permit=="許可"){
        expenseList.addItem(
          reqItems[i].roomID,
          reqItems[i].userName,
          reqItems[i].name,
          reqItems[i].type,
          0,
          reqItems[i].photos,
        );  //金額の入力を忘れ（ry
      }
      robot.send({room: reqItems[i].roomID}, itemName + "の申請が" + permit + "されました．");
    }
    for(let i=0; i<waitItems.length; i++) {
      okList.addItem(
        waitItems[i].name,
        waitItems[i].type,
        permit=="許可"
      );
      if(permit=="許可") {
        robot.send({room: waitItems[i].roomID}, itemName + "は経費で落ちるようになりました．");
      } else {
        robot.send({room: waitItems[i].roomID}, itemName + "は経費で落ちません．");
      }
    }
    if(waitItems.length!=0) {
      okList.addItem(itemName, waitItems[0].type, permit=="許可")
      waitList.eliminateItemByName(itemName);
    }
    if(requestList.length!=0) {
      requestList.eliminateItemByName(itemName);
    }
    res.send(itemName + "の申請を" + permit + "しました．")
  });

  /*
  // 経理部にメッセージを送信
  send = (msg) => {
    robot.send({room: accountingTalkRoomId}, msg);
  }

  // 平日10時に経理部にメッセージを送信
  new cronJob('00 10 * * 1-5', () => {
    send("メッセージ内容");
  }).start();
  */
}