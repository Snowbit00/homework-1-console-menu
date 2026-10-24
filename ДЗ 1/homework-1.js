const readline = require('readline');

const FREE_DELIVERY_TOTAL = 3000;
const FREE_DELIVERY_DISTANCE = 3;
const MID_DELIVERY_DISTANCE = 10;
const MID_DELIVERY_PRICE = 200;
const EXTRA_KM_PRICE = 25;
const LAST_STEP = 10;
const SKIPPED_STEP = 4;

// ---------- Задача 1. Билетная касса ----------

function ticketPrice(category) {
  switch (category) {
    case 1:
      return 300;
    case 2:
      return 500;
    case 3:
      return 900;
    default:
      return 0;
  }
}

function maxTickets(budget, price) {
  if (price <= 0) {
    return 0;
  }
  let left = budget;
  let count = 0;
  while (left >= price) {
    left -= price;
    count++;
  }
  return count;
}

function printTicketResult(category, budget) {
  const price = ticketPrice(category);
  if (price === 0) {
    console.log('неизвестная категория');
    return;
  }
  const count = maxTickets(budget, price);
  console.log(
    `Категория ${category}, билет ${price} руб., бюджет ${budget} руб.: можно купить ${count} шт.`
  );
}

// ---------- Задача 2. Доставка заказа ----------

function deliveryPrice(distance, total) {
  if (total >= FREE_DELIVERY_TOTAL || distance <= FREE_DELIVERY_DISTANCE) {
    return 0;
  }
  if (distance <= MID_DELIVERY_DISTANCE) {
    return MID_DELIVERY_PRICE;
  }
  return MID_DELIVERY_PRICE + (distance - MID_DELIVERY_DISTANCE) * EXTRA_KM_PRICE;
}

function printDelivery(distance, total) {
  const price = deliveryPrice(distance, total);
  console.log(`Расстояние ${distance} км, заказ ${total} руб.: доставка ${price} руб.`);
}

// ---------- Задача 3. Лестница ----------

function printSteps(height) {
  let built = 0;
  for (let step = 1; step <= height; step++) {
    if (step === SKIPPED_STEP) {
      continue;
    }
    if (step > LAST_STEP) {
      console.log('Дальше лестница не построена');
      break;
    }
    console.log(`Ступень ${step}`);
    built++;
  }
  console.log(`Всего построено: ${built}`);
}

// ---------- Меню ----------

function createAsk(rl) {
  const lines = [];
  const waiting = [];
  let closed = false;

  rl.on('line', (line) => {
    const resolve = waiting.shift();
    if (resolve) {
      resolve(line);
    } else {
      lines.push(line);
    }
  });
  rl.on('close', () => {
    closed = true;
    while (waiting.length > 0) {
      waiting.shift()('');
    }
  });

  return (question) => {
    process.stdout.write(question);
    if (lines.length > 0) {
      return Promise.resolve(lines.shift());
    }
    if (closed) {
      return Promise.resolve('');
    }
    return new Promise((resolve) => waiting.push(resolve));
  };
}

async function askNumber(ask, question) {
  const text = (await ask(question)).trim();
  const value = Number(text);
  if (text === '' || Number.isNaN(value)) {
    return null;
  }
  return value;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  const ask = createAsk(rl);

  console.log('Выберите задачу:');
  console.log('1 — билетная касса');
  console.log('2 — доставка заказа');
  console.log('3 — лестница');
  const choice = (await ask('Ваш выбор: ')).trim();

  if (choice === '1') {
    const category = await askNumber(ask, 'Категория билета: ');
    const budget = await askNumber(ask, 'Бюджет: ');
    if (category === null || budget === null) {
      console.log('нужно ввести число');
    } else {
      printTicketResult(category, budget);
    }
  } else if (choice === '2') {
    const distance = await askNumber(ask, 'Расстояние: ');
    const total = await askNumber(ask, 'Сумма заказа: ');
    if (distance === null || total === null) {
      console.log('нужно ввести число');
    } else {
      printDelivery(distance, total);
    }
  } else if (choice === '3') {
    const height = await askNumber(ask, 'Высота лестницы: ');
    if (height === null) {
      console.log('нужно ввести число');
    } else {
      printSteps(height);
    }
  } else {
    console.log('такой задачи нет');
  }

  rl.close();
}

main();
