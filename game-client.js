const zmq = require('zeromq');
const sock = new zmq.Request();

const min = parseInt(process.argv[2], 10);
const max = parseInt(process.argv[3], 10);
const secretNumber = Math.floor(Math.random() * (max - min + 1)) + min;

(async () => {
    console.log(`Загаданное число: ${secretNumber}`);
    await sock.connect('tcp://127.0.0.1:3000');
    console.log('Клиент подключен к порту 3000');

    await sock.send(JSON.stringify({range: `${min}-${max}`}));

    for await (const [msg] of sock) {
        const message = JSON.parse(msg.toString());
        console.log('Получен ответ от сервера:', message);

        if (message.answer < secretNumber) {
            await sock.send(JSON.stringify({hint: 'more'}));
        } else if (message.answer > secretNumber) {
            await sock.send(JSON.stringify({hint: 'less'}));
        } else {
            console.log('Игра окончена. Сервер угадал число!');
            break;
        }
    }
})();
