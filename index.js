const prompt = require('prompt-sync')();
const fs = require('fs');

console.log(`Добро пожаловать в консольную игру RPG`);

const playerName = prompt("Как вас зовут герой? ");
console.log("приветсвуем, " + playerName + " Ваше приключение начинается ...");

class Character {
    constructor(name, health = 100, level = 1, experiance = 0) {
        this.name = name;
        this.maxHealth = 100;
        this.health = health;
        this.level = level;
        this.experiance = experiance;
        this.equiped = {
            'armor': null,
            'weapon': null
        }

        this.inventory = new Map();
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`${this.name} получил ${amount} урона. Здоровье: ${this.health}`);
    }

    addItem(itemName, count = 1) {
        let current = this.inventory.get(itemName) || 0;
        this.inventory.set(itemName, current + count);
        console.log(`${this.name} получил: ${count} - ${itemName}`);
    }

    showInvetory() {
        console.log(`\n === Инвентарь ===`);

        if(this.inventory.size === 0) {
            console.log("Пусто");
        } else {
            for (const [item, quantity] of this.inventory) {
                console.log(`  ${item}: ${quantity} шт.`);
            }
        }   
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
        3. Сохранить игру
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
           player.showInvetory();
        break;

        case "3":
            saveGame(player);
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
    try {
        const savedData = {
            name: player.name,
            maxHealth: player.maxHealth,
            health: player.health,
            level: player.level,
            experiance: player.experiance,
            equiped: player.equiped,
            inventory: Array.from(player.inventory.entries())
        }

        fs.writeFileSync('savegame.json', JSON.stringify(savedData, null, 2));
        console.log("Игра сохранена!");
        return true;

    } catch (err) {
        console.error("Ошибка сохранения", err);
        return false;
    }
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

        player.name = savedData.name;
        player.maxHealth = savedData.maxHealth;
        player.health = savedData.health;
        player.level = savedData.level;
        player.experiance = savedData.experiance;
        player.equiped = savedData.equiped;
        player.inventory = new Map(savedData.inventory || []);

        

        console.log('=== Игра загружена! ===');
        console.log(`Имя: ${player.name}`);
        console.log(`Уровень: ${player.level} (Опыт: ${player.experiance})`);
        console.log(`Здоровье: ${player.maxHealth}/${player.health}`);
        console.log('=======================');
        return true;
    } catch (err) {
        console.error("Ошибка чтения", err);
        return false;
    }
}
