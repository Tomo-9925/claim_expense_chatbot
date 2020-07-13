'use strict';

const isExpensable = require('./functions/q_and_a.js');
const waitList = require('./functions/registrationWaitList');

module.exports = (robot) => {
  robot.hear(/^.+は経費で落ちますか$/i, (res) => {
    var name = res.match[0];
    name = name.slice(6, -9);
    isExpensable.isExpensable(name);
    var yesno = isExpensable.isExpensable(name);
    if (yesno == true) {
      res.send ('経費で落ちます');
    } else if (yesno == false) {
      res.send ('経費で落ちません');
    } else {
      res.send ('経理に確認します');
      waitList.addItem(
        res.message.room,
        res.message.user.name,
        name,
        "",
        0,
        []
      );  // 大事故。
    }
  });
}
