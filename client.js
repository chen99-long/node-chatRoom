const net = require('net');
const types = require('./types');

// 默认没有昵称
let nickname = null

const client = net.createConnection({
  host: 'localhost',
  port:3001
})


// 连接服务器
client.on('connect', () => {
  console.log('已连接到服务器');

  process.stdout.write('请输入昵称:');

  // 监听终端输入，把输入的内容发送给服务器
  process.stdin.on('data',data=>{
    // 由于是二进制数据，因此需要转化成字符串
    data = data.toString().trim();
    if(!nickname){
     return  client.write(JSON.stringify({
        type:types.login,
        nickname:data
      }));
    }else{

      const matches = /^@(\w+)\s(.+)$/.exec(data);

      if(matches){
        return client.write(JSON.stringify({
          type:types.psp,
          nickname:matches[1],
          message:matches[2]
        }))
      }

      client.write(JSON.stringify({
        message:data,
        type:types.broadcast
      })
          )
    }

    
    
  })
})

client.on('data',data=>{
  data = JSON.parse(data.toString());
  // console.log(data);
  switch (data.type) {
    
    case types.login:
    if(!data.success){
      // 登录失败，打印失败原因
      console.log(data.message);
      // 提示用户重新输入
      process.stdout.write('请重新输入昵称:');
      
    }else{
      console.log(`登录成功，当前在线用户：${data.sumUsers}人`);
      nickname = data.nickname
    }
      break;
    case types.broadcast:
      console.log(data.nickname + ':' + data.message);
      break;
    case types.psp:
      console.log(data.nickname + '对你说:' + data.message);
    default:
      break;
  }

})