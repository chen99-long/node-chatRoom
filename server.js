const net = require('net');
const types = require('./types');

const server = net.createServer()

// 存储客户端
const users = []

server.on("connection", (clientSocket) => {
  clientSocket.on("data", (data) => {
    data =JSON.parse(data.toString())
    switch (data.type) {
      case types.login:
        if(users.find(user=>user.nickname === data.nickname)){
          console.log(users);
          console.log(data.name);
          // 能找到就代表昵称重复了
          return clientSocket.write(JSON.stringify({
            type:types.login,
            success:false,
            message:"昵称重复了！"
          })
            )
        }else{
          clientSocket.nickname = data.nickname
          users.push(clientSocket)
          // 告诉客户端登录成功
          users.forEach(user=>{
            if(user === clientSocket){
              user.write(JSON.stringify({
                type:types.login,
                success:true,
                message:"登录成功！",
                nickname:data.nickname,
                sumUsers:users.length
            }))
            }else{
              user.write(JSON.stringify({
                type:types.broadcast,
                nickname:"系统",
                message:`${data.nickname}加入了聊天室！当前在线人数:${users.length}`,
              }))
            }
          })
        }
        break;
      case types.broadcast:
        users.forEach(user=>{
          if(user === clientSocket) return
          user.write(JSON.stringify({
            type:types.broadcast,
            nickname:clientSocket.nickname,
            message:data.message
          })
              )
        })
        break;
      case types.psp:
        const user = users.find(user=>user.nickname === data.nickname)
        if(user){
          user.write(JSON.stringify({
            type:types.psp,
            success:true,
            nickname:clientSocket.nickname,
            message:data.message
          }))
        }
        break;
    }
  })

  // 监听用户离开
  clientSocket.on('end',()=>{
    const userIndex = users.findIndex(user=>user.nickname === clientSocket.nickname)
    users.splice(userIndex,1)
    users.forEach(user=>{
      user.write(JSON.stringify({
        type:types.broadcast,
        nickname:"系统",
        message:`${clientSocket.nickname}离开了聊天室！当前在线人数:${users.length}`,
      }))
    })
  })
})

server.listen(3001, () => {
  console.log("tcp服务器启动～～");
})