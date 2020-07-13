'use strict';

const requestList = require('./functions/registrationRequestList');
const okList = require('./functions/q_and_a');
const expenseList = require('./functions/expenseList')

// セッションの管理
// 'userId', 'userName', 'roomId', 'objectPhotos', 'objectName', 'objectType'をキーとする連想配列を格納．
let sessions = [];

// sessionsからセッションの抽出
// セッションは1ユーザ，1つのみ
const searchSession = (userId) => {
  for(let i=0; i<sessions.length; i++) {
    if(sessions[i].userId == userId) {
      return i;
    }
  }
  return -1;
};

// 写真ファイルのダウンロード処理，セッションへのファイルパスの追加
const downloadFile = (res, file) => {
  res.download(file, (path) => {
    let sessionNum = searchSession(res.message.user.id);
    sessions[sessionNum].objectPhotos.push(path);
  });
};

// セッション情報に物品名と品目名を追加
const recordObject = (res, object) => {
  let sessionNum = searchSession(res.message.user.id);
  sessions[sessionNum].objectName = object[0];
  sessions[sessionNum].objectType = object[1];
};

// セッションの情報表示（デバッグ用）
const showSession = (sessionNum) => {
  let session = sessions[sessionNum];
  console.log(
    session.userId + "\n" +
    session.userName + "\n" +
    session.roomId + "\n" +
    session.objectPhotos + "\n" +
    session.objectName + "\n" +
    session.objectType + "\n"
  );
};

// 申請内容の確認
// 同期処理の必要があるかもしれない…
const confirmSession = (res) => {
  let sessionNum = searchSession(res.message.user.id);
  let session = sessions[sessionNum];
  if(okList.isExpensable(session.objectName)) {
    // showSession(sessionNum);
    res.send(session.objectName+"の経費申請を受理しました．");
    expenseList.addItem(
      session.roomId,
      session.userName,
      session.objectName,
      session.objectType,
      0,
      session.objectPhotos
    );  // 金額を受け取るの忘れてた（テヘペロ
    sessions.splice(sessionNum, 1);
  } else {
    res.send("経費で受理されるか確認を行います．");
    requestList.addItem(
      session.roomId,
      session.userName,
      session.objectName,
      session.objectType,
      session.objectPhotos
    ) // 登録待機リストに追加
  }
};


// 相手に送信するメッセージの型
const message = {
  'notFinishSession': "前回の経費申請が終了していません．",
  'notStartSession': "経費申請が開始されていません．\n経費申請 と入力して，経費申請を開始してください．",
  'startSession': "何を買いましたか？\n物品や領収証の写真を送信してください．",
  'askObject': "必要があれば写真を更に送信してください．\n写真の送信が終了したら，物品名と品目の情報を送信してください．\n（スペースやコンマで区切って送信してください．）",
  'notSpecifiedFormat': "スペースやコンマで区切って送信してください．"
};

// ボットのトリガーを記述
module.exports = (robot) => {
  // 経費申請開始
  robot.respond(/経費申請$/ui, (res) => {
    if (searchSession(res.message.user.id) != -1) {
      // セッションが終了していないときのエラー
      res.send(message.notFinishSession);
      return false;
    }
    let session = {
      'userId': res.message.user.id,
      'userName': res.message.user.name,
      'roomId': res.message.room,
      'objectPhotos': [],
      'objectName': '',
      'objectType': ''
    };
    sessions.push(session);
    res.send(message.startSession);
  });

  // 写真の受信（1枚のみ）
  robot.respond('file', (res) => {
    if (searchSession(res.message.user.id) == -1) {
      // セッションが開始されていないときのエラー
      res.send(message.notStartSession);
      return false;
    }
    downloadFile(res, res.json);
    res.send(message.askObject);
  });

  // 写真の受信（複数枚）
  robot.respond('files', (res) => {
    if (searchSession(res.message.user.id) == -1) {
      res.send(message.notStartSession);
      return false;
    }
    for (const file of res.json.files) {
      downloadFile(res, file);
    }
    res.send(message.askObject);
  });

  // 物品名と品目名の取得
  robot.respond(/[^ ,　，、]+[ ,　，、]+[^ ,　，、]+$/ui, (res) => {
    if (searchSession(res.message.user.id) == -1) {
      res.send(message.notStartSession);
      return false;
    }
    let resMsg = res.match[0];
    let str = resMsg.split(/[ ,　，、]+/ui);
    if(str.length!=3) {
      res.send(message.notSpecifiedFormat);
      return false;
    }
    str.shift(); // str[0]を物品名，str[1]を品目名とする
    recordObject(res, str);
    confirmSession(res);
  });
};