const prompt = require('prompt-sync')();
const fs = require('fs');

console.log(`Добро пожаловать в консольную игру RPG`);

const playerName = prompt("Как вас зовут герой? ");
console.log("приветсвуем, " + playerName + " Ваше приключение начинается ...");

class Character {
    constructor(name, health = 100, level = 1) {
        this.name = name;
        this.health = health;
        this.level = level;
        this.inventory = [];
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`${this.name} получил ${amount} урона. Здоровье: ${this.health}`);
    }

    addItem(item) {
        this.inventory.push(item);
        console.log(`${this.name} получил предмет: ${item}`);
    }

    loadSaved(playerSaved) {
        Object.assign(this, playerSaved);
        console.log('Данные загружены в персонажа');
        return this;
    }
}

const player = new Character(playerName);

console.log(`Здоровье: ${player.health}`);
console.log(`Уровень: ${player.level}`);
console.log(`---`);

let gameRunning = true;

while(gameRunning) {
    console.log(`
        Что вы хотите сделать? 
        1. Иследовать лес
        2. Проверить инвентарь
        3. Сохранинить игру
        4. Загрузить сохранение
        5. Выйти`);
    
    const choice = prompt(`Ваш выбор (1-5): `);

    switch(choice) {
        case '1':
            const encounter = Math.random();
            if(encounter < 0.3) {
                console.log("Вы ношли сундук с сокровищами");
                player.addItem("Золотая монета");
            } else if (encounter < 0.6) {
                console.log("На вас напал гоблин!");
                player.takeDamage(15);
            } else {
                console.log("Вы спокойно прогуливаетесь по лесу ...")
            }
        break;

        case "2":
            console.log(`=== Инвентарь ===`);
            if(player.inventory.length === 0) {
                console.log("Пусто");
            } else {
                player.inventory.forEach((item, index) => console.log(`${index + 1}. ${item}`));
            }
        break;

        case "3":
            saveGame(player)
                .then(() => console.log("Игра Сохранена"))
                .catch(err => console.error("Ошибка сохранения", err));
        break;

        case "4": 
            loadGameSync();
        break;

        case "5":
            console.log("До новых встреч");
            gameRunning = false;
            break;
        
        default:
            console.log("Неверный выбор, попробуйте ещё раз");
    }

    if(player.health <= 0) {
        console.log(` === Вы проиграли! ===`);
        gameRunning = false;
    }
}

// function for saveGame in JSON
function saveGame(player) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(player, null, 2);

        fs.writeFile('savegame.json', data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
};

// Inspect, if is saveGame
console.log(`
    
    === Проверяем сохраненную игру ===`);
fs.readFile('savegame.json', 'utf8', (err, data) => {
    if(!err) {
        console.log(`Найденно сохранение:`);
        console.log(data);
    }
});

function loadGameSync() {
    try {
        if(!fs.existsSync('savegame.json')) {
            console.log("Сохранений не найденно");
            return false;
        }

        const data = fs.readFileSync('savegame.json', 'utf8');
        const savedData = JSON.parse(data);

        Object.keys(savedData).forEach(key => player[key] = savedData[key]);

        console.log('=== Игра загружена! ===');
        console.log(`Имя: ${player.name}`);
        console.log(`Здоровье: ${player.health}`);
        console.log(`Уровень: ${player.level}`);
        console.log(`Инвентарь: ${player.inventory.join(', ') || 'пусто'}`);
        console.log('=======================');
        return true;
    } catch (err) {
        console.error("Ошибка чтения", err);
        return false;
    }
}
