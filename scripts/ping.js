// Description:
//   Utility commands surrounding Hubot uptime.
//
// Commands:
//   ping - Reply with pong
//   echo <text> - Reply back with <text>
//   time - Reply with current time
'use strict';

// const test = require('./functions/test');
// import Kurasu from './functions/kurasu';

module.exports = (robot) => {
  robot.respond(/PING$/i, (res) => {
    res.send('PONG');
  });

  robot.respond(/ADAPTER$/i, (res) => {
    res.send(robot.adapterName);
  });

  robot.respond(/ECHO (.*)$/i, (res) => {
    res.send(res.match[1]);
  });

  robot.respond(/TIME$/i, (res) => {
    res.send(`Server time is: ${new Date()}`);
  });

  // robot.respond(/A (.*)$/i, (res) => {
  //   let kurasu = Kurasu.new("aaa");
  //   res.send(test.test(res.match[1]));
  // });
};