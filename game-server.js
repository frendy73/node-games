const zmq = require('zeromq');
const sock = new zmq.Reply();

let min = 0;
let max = 100;
let guess;

function updateGuess(hint) {
    if (hint === 'more') {
        min = guess + 1;
    } else if (hint === 'less') {
        max = guess - 1;
    }
    guess = Math.floor((min + max) / 2);
}

(async () => {
    await sock.bind('tcp://127.0.0.1:3000');
    console.log('Сервер запущен на порту 3000. Готов к игре...');

    for await (const [msg] of sock) {
        const message = JSON.parse(msg.toString());
        console.log('Получено сообщение от клиента:', message);

        if (message.range) {
            [min, max] = message.range.split('-').map(Number);
            guess = Math.floor((min + max) / 2);
            await sock.send(JSON.stringify({answer: guess}));
        } else if (message.hint) {
            updateGuess(message.hint);
            await sock.send(JSON.stringify({answer: guess}));
        }
    }
})();
