// Генератор вариаций вопросов: код, переменные и значения меняются каждый раз.
// Дополняет статический банк QUESTIONS динамическими вариантами.
(function () {
  "use strict";

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const pyList = (arr) => "[" + arr.map((x) => '"' + x + '"').join(", ") + "]";

  // Язык шаблона. Русская версия возвращает первый аргумент, английская —
  // второй, поэтому логика генерации остаётся общей, а текст не переводится
  // постфактум регулярками: перевод стоит рядом с фразой, которую он
  // переводит. window.PyI18n появляется из i18n.js раньше этого файла;
  // __PYQUIZ_LANG нужен проверкам в node, где нет DOM.
  const EN = typeof window !== "undefined" &&
    ((window.PyI18n && window.PyI18n.language === "en") || window.__PYQUIZ_LANG === "en");
  const L = (ru, en) => (EN ? en : ru);

  function numWrongs(c, count) {
    const pool = [c + 1, c - 1, c + 2, c - 2, c + 3, c * 2, c - 3];
    const out = [];
    for (const v of pool) {
      if (v !== c && !out.includes(v)) out.push(v);
      if (out.length >= (count || 3)) break;
    }
    let k = 4;
    while (out.length < (count || 3)) {
      if (!out.includes(c + k)) out.push(c + k);
      k++;
    }
    return out;
  }

  function options(correct, wrongs) {
    const c = String(correct);
    const opts = [];
    const seen = { };
    seen[c] = true;
    for (const w of wrongs || []) {
      const s = String(w);
      if (!seen[s]) { seen[s] = true; opts.push(s); }
      if (opts.length === 3) break;
    }
    let k = 1;
    while (opts.length < 3) {
      const s = c + " #" + k;
      if (!seen[s]) { seen[s] = true; opts.push(s); }
      k++;
    }
    const at = rnd(0, 3);
    const full = opts.slice(0, 3);
    full.splice(at, 0, c);
    return { options: full, answer: at };
  }

  // Строгий вариант options(): все три неверных варианта обязаны отличаться
  // от правильного. Обычный options() в таком случае подставляет заглушки
  // вида «12 #1», которые никто не назовёт ответом на вопрос о списках.
  function mcOptions(correct, wrongs, filler) {
    const seen = {};
    seen[String(correct)] = true;
    const pool = [];
    (wrongs || []).forEach((w) => {
      const s = String(w);
      if (!seen[s]) {
        seen[s] = true;
        pool.push(s);
      }
    });
    for (let i = 1; pool.length < 3 && i < 40 && filler; i++) {
      const s = String(filler(i));
      if (!seen[s]) {
        seen[s] = true;
        pool.push(s);
      }
    }
    const opts = pool.slice(0, 3);
    const at = rnd(0, 3);
    opts.splice(at, 0, String(correct));
    return { options: opts, answer: at };
  }

  const NAME = L(["Герой", "Орк", "Путник", "Стрелок", "Маг"],
    ["Hero", "Orc", "Wanderer", "Archer", "Mage"]);
  const WEAPON = L(["меч", "щит", "зелье", "лук", "копьё", "топор"],
    ["sword", "shield", "potion", "bow", "spear", "axe"]);
  const WORD = L(["дракон", "орк", "слизь", "скелет", "тролль", "гоблин"],
    ["dragon", "orc", "slime", "skeleton", "troll", "goblin"]);

  // Каждая функция возвращает один случайный вопрос.
  const TEMPLATES = [
    // 1. Арифметика
    () => {
      const a = rnd(2, 9), b = rnd(2, 9), op = pick(["+", "-", "*"]);
      const val = op === "+" ? a + b : op === "-" ? a - b : a * b;
      const q = options(val, numWrongs(val));
      return { topic: "operators", level: op === "*" ? 2 : 1, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(" + a + " " + op + " " + b + ")",
        options: q.options, answer: q.answer,
        explanation: L("Порядок и знак: " + a + " " + op + " " + b + " = " + val + ".",
          "Order and sign: " + a + " " + op + " " + b + " = " + val + ".") };
    },
    // 2. Целочисленное деление / остаток
    () => {
      const a = rnd(7, 30), b = rnd(2, 6), op = pick(["//", "%"]);
      const div = Math.floor(a / b), mod = a % b;
      const val = op === "//" ? div : mod;
      const wrongs = op === "//" ? [mod, a * b, Math.round(a / b)] : [div, a + b, b];
      const q = options(val, wrongs.concat(numWrongs(val)));
      return { topic: "operators", level: 2, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(" + a + " " + op + " " + b + ")",
        options: q.options, answer: q.answer,
        explanation: L(
          (op === "//" ? "// — целая часть деления" : "% — остаток от деления"),
          (op === "//" ? "// gives the whole part of a division" : "% gives the remainder of a division")) +
          ": " + a + " " + op + " " + b + " = " + val + "." };
    },
    // 3. Степень
    () => {
      const a = rnd(2, 6), b = rnd(2, 3);
      const val = Math.pow(a, b);
      const q = options(val, [a * b, a + b, Math.pow(b, a)]);
      return { topic: "operators", level: 2, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(" + a + " ** " + b + ")",
        options: q.options, answer: q.answer,
        explanation: L("** — возведение в степень: ", "** raises to a power: ") +
          a + " ** " + b + " = " + val + "." };
    },
    // 4. Склейка строк
    () => {
      const a = rnd(1, 9), b = rnd(1, 9);
      const correct = "" + a + b;
      const q = options(correct, [a + b, a + " " + b, b + "" + a]);
      return { topic: "types", level: 2, text: L("Что выведет этот код?", "What will this code print?"),
        code: 'print(str(' + a + ") + str(" + b + "))",
        options: q.options, answer: q.answer,
        explanation: L("str() делает строки, а + их склеивает: получится " + correct + ".",
          "str() makes strings and + joins them: the result is " + correct + ".") };
    },
    // 5. Повтор строки
    () => {
      const w = L(pick(["ха", "ау", "но"]), pick(["ha", "au", "no"])), n = rnd(2, 4);
      const correct = w.repeat(n);
      const q = options(correct, [w.repeat(n - 1), w + " " + n, w.repeat(n) + w]);
      return { topic: "strings", level: 2, text: L("Что выведет этот код?", "What will this code print?"),
        code: 'print("' + w + '" * ' + n + ")",
        options: q.options, answer: q.answer,
        explanation: L("Умножение строки на число повторяет её " + n + " раз: " + correct + ".",
          "Multiplying a string by a number repeats it " + n + " times: " + correct + ".") };
    },
    // 6. Длина строки
    () => {
      const w = pick(WORD);
      const val = w.length;
      const q = options(val, numWrongs(val));
      return { topic: "strings", level: 2, text: L("Что выведет этот код?", "What will this code print?"),
        code: 'print(len("' + w + '"))',
        options: q.options, answer: q.answer,
        explanation: L("len() считает число символов: в слове «" + w + "» их " + val + ".",
          "len() counts characters: the word “" + w + "” has " + val + ".") };
    },
    // 7. Индекс списка
    () => {
      const arr = shuffle(WEAPON.slice()).slice(0, 5);
      const i = rnd(0, 4);
      const correct = arr[i];
      const q = options(correct, arr.filter((x) => x !== correct));
      return { topic: "collections", level: 2, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(" + pyList(arr) + "[" + i + "])",
        options: q.options, answer: q.answer,
        explanation: L("Индекс " + i + " — это элемент номер " + (i + 1) + ", то есть «" + correct + "».",
          "Index " + i + " is item number " + (i + 1) + ", that is “" + correct + "”.") };
    },
    // 8. Отрицательный индекс
    () => {
      const arr = shuffle(WEAPON.slice()).slice(0, 4);
      const k = rnd(1, 3);
      const correct = arr[arr.length - k];
      const q = options(correct, arr.filter((x) => x !== correct));
      return { topic: "collections", level: 3, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(" + pyList(arr) + "[-" + k + "])",
        options: q.options, answer: q.answer,
        explanation: L("Индекс -" + k + " считает с конца: «" + correct + "».",
          "Index -" + k + " counts from the end: “" + correct + "”.") };
    },
    // 9. Срез списка
    () => {
      const arr = shuffle(WEAPON.slice()).slice(0, 5);
      const start = rnd(0, 1), take = rnd(2, 3);
      const correct = pyList(arr.slice(start, start + take));
      const q = options(correct, [
        pyList(arr.slice(start, start + take - 1)),
        pyList(arr.slice(start + 1, start + 1 + take)),
        pyList(arr.slice(start, start + take + 1))
      ]);
      return { topic: "collections", level: 3, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(" + pyList(arr) + "[" + start + ":" + (start + take) + "])",
        options: q.options, answer: q.answer,
        explanation: L("Срез берёт элементы с " + start + " по " + (start + take - 1) + ", последний не включается.",
          "A slice takes items from " + start + " to " + (start + take - 1) + "; the last one is not included.") };
    },
    // 10. Сколько раз выполнится for range(n)
    () => {
      const n = rnd(2, 6);
      const q = options(n, numWrongs(n));
      return { topic: "control", level: 2, text: L("Сколько чисел выведет этот код?", "How many numbers will this code print?"),
        code: "for i in range(" + n + "):\n    print(i)",
        options: q.options, answer: q.answer,
        explanation: L("range(" + n + ") даёт числа от 0 до " + (n - 1) + " — всего " + n + ".",
          "range(" + n + ") gives numbers from 0 to " + (n - 1) + " — " + n + " in total.") };
    },
    // 11. range(a, b)
    () => {
      const a = rnd(1, 3), b = a + rnd(2, 4);
      const val = b - a;
      const q = options(val, numWrongs(val));
      return { topic: "control", level: 3, text: L("Сколько чисел выведет этот код?", "How many numbers will this code print?"),
        code: "for i in range(" + a + ", " + b + "):\n    print(i)",
        options: q.options, answer: q.answer,
        explanation: L("range(" + a + ", " + b + ") даёт числа с " + a + " по " + (b - 1) + " — это " + val + ".",
          "range(" + a + ", " + b + ") gives numbers from " + a + " to " + (b - 1) + " — that is " + val + ".") };
    },
    // 12. while
    () => {
      const start = rnd(3, 6);
      const q = options(start, numWrongs(start));
      return { topic: "control", level: 3, text: L("Сколько чисел выведет этот код?", "How many numbers will this code print?"),
        code: "i = " + start + "\nwhile i > 0:\n    print(i)\n    i = i - 1",
        options: q.options, answer: q.answer,
        explanation: L("Цикл идёт от " + start + " до 1 — всего " + start + " повторений.",
          "The loop goes from " + start + " down to 1 — " + start + " iterations in total.") };
    },
    // 13. bool
    () => {
      const cases = L([
        { v: "0", b: false, code: "print(bool(0))" },
        { v: "1", b: true, code: "print(bool(1))" },
        { v: '"орк"', b: true, code: 'print(bool("орк"))' },
        { v: '""', b: false, code: 'print(bool(""))' },
        { v: "[]", b: false, code: "print(bool([]))" },
        { v: "[1, 2]", b: true, code: "print(bool([1, 2]))" }
      ], [
        { v: "0", b: false, code: "print(bool(0))" },
        { v: "1", b: true, code: "print(bool(1))" },
        { v: '"orc"', b: true, code: 'print(bool("orc"))' },
        { v: '""', b: false, code: 'print(bool(""))' },
        { v: "[]", b: false, code: "print(bool([]))" },
        { v: "[1, 2]", b: true, code: "print(bool([1, 2]))" }
      ]);
      const c = pick(cases);
      const correct = c.b ? "True" : "False";
      const q = options(correct, [c.b ? "False" : "True", "None", "0"]);
      return { topic: "types", level: 3, text: L("Что выведет этот код?", "What will this code print?"),
        code: c.code, options: q.options, answer: q.answer,
        explanation: L("Пустое и ноль — ложь, остальное — истина: результат " + correct + ".",
          "Empty values and zero are false, everything else is true: the result is " + correct + ".") };
    },
    // 14. Сравнение
    () => {
      const a = rnd(1, 9), b = rnd(1, 9), op = pick(["==", "!=", ">", "<"]);
      let val;
      if (op === "==") val = a === b;
      else if (op === "!=") val = a !== b;
      else if (op === ">") val = a > b;
      else val = a < b;
      const correct = val ? "True" : "False";
      const q = options(correct, [val ? "False" : "True", "" + a + b, L("Ошибка", "Error")]);
      return { topic: "operators", level: 2, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(" + a + " " + op + " " + b + ")",
        options: q.options, answer: q.answer,
        explanation: L("Сравнение " + a + " " + op + " " + b + " — это " + correct + ".",
          "The comparison " + a + " " + op + " " + b + " is " + correct + ".") };
    },
    // 15. Методы строк
    () => {
      const w = pick(L(["меч", "щит", "орк", "лук"], ["sword", "shield", "orc", "bow"]));
      const up = pick([true, false]);
      const correct = up ? w.toUpperCase() : w.toUpperCase().toLowerCase();
      const q = options(correct, [up ? w.toUpperCase().toLowerCase() : w.toUpperCase(), w + "!", w.length]);
      return { topic: "strings", level: 2, text: L("Что выведет этот код?", "What will this code print?"),
        code: 'print("' + w + '".' + (up ? "upper" : "lower") + "())",
        options: q.options, answer: q.answer,
        explanation: "." + (up ? "upper()" : "lower()") +
          L(" меняет регистр букв: ", " changes letter case: ") + correct + "." };
    },
    // 16. max / min
    () => {
      const nums = [rnd(1, 40), rnd(1, 40), rnd(1, 40), rnd(1, 40)];
      const up = pick([true, false]);
      const val = up ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
      const others = nums.filter((x) => x !== val);
      const q = options(val, others.concat(numWrongs(val)));
      return { topic: "collections", level: 3, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(" + (up ? "max" : "min") + "([" + nums.join(", ") + "]))",
        options: q.options, answer: q.answer,
        explanation: (up ? "max()" : "min()") + L(
          " возвращает " + (up ? "наибольшее" : "наименьшее") + " число: " + val + ".",
          " returns the " + (up ? "largest" : "smallest") + " number: " + val + ".") };
    },
    // 17. f-строка
    () => {
      const nm = pick(NAME), hp = rnd(10, 99);
      const correct = L("У " + nm + " " + hp + " HP", nm + " has " + hp + " HP");
      const q = options(correct, L([
        "У " + nm + " hp HP",
        "У {nm} " + hp + " HP",
        "У " + nm + " " + hp
      ], [
        nm + " has hp HP",
        "{name} has " + hp + " HP",
        nm + " " + hp + " HP"
      ]));
      return { topic: "strings", level: 3, text: L("Что выведет этот код?", "What will this code print?"),
        code: L('name = "' + nm + '"\nhp = ' + hp + '\nprint(f"У {name} {hp} HP")',
          'name = "' + nm + '"\nhp = ' + hp + '\nprint(f"{name} has {hp} HP")'),
        options: q.options, answer: q.answer,
        explanation: L("f-строка подставляет значения переменных из {…}.",
          "The f-string substitutes variable values from {…}.") };
    },
    // 18. Словарь
    () => {
      const has = pick([true, false]);
      const correct = "" + (has ? 42 : 0);
      const q = options(correct, has ? ["0", "None", L("Ошибка", "Error")] : ["42", "None", L("Ошибка", "Error")]);
      const code = 'hero = {"hp": 42}\nprint(hero.get("' + (has ? "hp" : "mp") + '", 0))';
      return { topic: "collections", level: 3, text: L("Что выведет этот код?", "What will this code print?"),
        code: code, options: q.options, answer: q.answer,
        explanation: has
          ? L("Ключ есть — вернётся значение 42.", "The key exists — the value 42 is returned.")
          : L("Ключа нет — get() вернёт второй аргумент, 0.", "No such key — get() returns the second argument, 0.") };
    },

    // ================= Строгие задания (level 4) =================
    // Последние этажи (Проклятый склеп, Тронный зал, Логово дракона) просят
    // qmin: 4. Раньше для них не было НИ ОДНОГО вариативного вопроса —
    // только 21 статический, и они повторялись до приторности.

    // 19. Сортировка и разворот
    () => {
      const arr = shuffle(WEAPON.slice()).slice(0, 4);
      const up = pick([true, false]);
      const correct = pyList(up ? arr.slice().sort() : arr.slice().reverse());
      const src = pyList(arr);
      const q = mcOptions(correct, [
        pyList(arr),
        pyList(up ? arr.slice().reverse() : arr.slice().sort()),
        pyList(arr.slice(1).concat([arr[0]]))
      ], (i) => pyList(arr.slice(i).concat(arr.slice(0, i))));
      return { topic: "collections", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "a = " + src + "\nprint(" + (up ? "sorted(a)" : "a[::-1]") + ")",
        options: q.options, answer: q.answer,
        explanation: L(
          up ? "sorted() возвращает новый отсортированный список, исходный не меняется."
            : "Срез с шагом −1 разворачивает список.",
          up ? "sorted() returns a new sorted list; the original is left unchanged."
            : "A slice with step −1 reverses the list.") };
    },
    // 20. Перебор словаря
    () => {
      const names = shuffle(L(NAME.concat(["Тролль", "Кобольд"]), NAME.concat(["Troll", "Kobold"]))).slice(0, 3);
      const which = rnd(0, 2);
      const dict = names.map((n, i) => '"' + n + '": ' + (i + 2) * 5).join(", ");
      const correct = String((which + 2) * 5);
      const q = mcOptions(correct, names.map((_, i) => String((i + 2) * 5 + 5)),
        (i) => String((which + 2) * 5 + 10 * (i + 1)));
      return { topic: "collections", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "h = {" + dict + "}\nprint(h['" + names[which] + "'])",
        options: q.options, answer: q.answer,
        explanation: L("Ключ «" + names[which] + "» хранит значение " + correct + ".",
          "The key “" + names[which] + "” stores the value " + correct + ".") };
    },
    // 21. Генераторное выражение
    () => {
      const n = rnd(3, 6);
      const val = n * (n - 1); // сумма 2·x при x от 0 до n−1
      const q = options(val, numWrongs(val), (i) => n + i);
      return { topic: "collections", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "print(sum(x * 2 for x in range(" + n + ")))",
        options: q.options, answer: q.answer,
        explanation: L("Сумма чисел от 0 до " + (n - 1) + ", удвоенных: 2 × " +
          (n * (n - 1) / 2) + " = " + val + ".",
          "The sum of the numbers from 0 to " + (n - 1) + ", doubled: 2 × " +
          (n * (n - 1) / 2) + " = " + val + ".") };
    },
    // 22. Вложенный цикл
    () => {
      const a = rnd(2, 4), b = rnd(2, 4);
      const val = a * b;
      const q = options(val, numWrongs(val));
      return { topic: "control", level: 4, text: L("Сколько чисел выведет этот код?", "How many numbers will this code print?"),
        code: "for i in range(" + a + "):\n    for j in range(" + b + "):\n        print(i, j)",
        options: q.options, answer: q.answer,
        explanation: L("Внутренний цикл выполнится " + a + " раз, по " + b + " шага каждый: " + val + ".",
          "The inner loop runs " + a + " times, " + b + " steps each: " + val + ".") };
    },
    // 23. break в цикле
    () => {
      const arr = shuffle(WEAPON.concat(L(["кирка", "факел"], ["pickaxe", "torch"]))).slice(0, 5);
      const i = rnd(1, 3);
      // break стоит ДО print, поэтому напечатаны элементы до arr[i],
      // а сам arr[i] уже не выводится.
      const correct = pyList(arr.slice(0, i));
      const q = mcOptions(correct, [
        pyList(arr.slice(0, i + 1)),
        pyList(arr),
        pyList(arr.slice(i))
      ], () => pyList(arr.slice(1).concat([arr[0]])));
      return { topic: "control", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        // Собираем результат в список: иначе print(x) даёт по строке на
        // элемент, и ответ «список» не совпадает с настоящим выводом.
        code: "a = " + pyList(arr) + "\nout = []\nfor x in a:\n    if x == '" +
          arr[i] + "':\n        break\n    out.append(x)\nprint(out)",
        options: q.options, answer: q.answer,
        explanation: L("break выходит из цикла ДО append, поэтому «" + arr[i] +
          "» в список не попадает.",
          "break leaves the loop BEFORE append, so “" + arr[i] + "” never gets into the list.") };
    },
    // 24. Функция с возвратом
    () => {
      const n = rnd(2, 9);
      const sq = n * n;
      const q = options(sq, [n + 2, n * 3, n + n + 1].concat(numWrongs(sq)),
        (i) => sq + i);
      return { topic: "functions", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "def f(x):\n    return x * x\n\nprint(f(" + n + "))",
        options: q.options, answer: q.answer,
        explanation: L("return отдаёт результат, f(" + n + ") = " + sq + ".",
          "return hands back the result, f(" + n + ") = " + sq + ".") };
    },
    // 25. Значение по умолчанию и вызов по имени
    () => {
      const d = rnd(2, 5), mul = rnd(2, 4);
      const val = d * mul;
      const q = options(val, [d + mul, d, mul, d * mul + 1].concat(numWrongs(val)), (i) => val + i);
      return { topic: "functions", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "def f(a, b=" + d + "):\n    return a * b\n\nprint(f(" + mul + "))",
        options: q.options, answer: q.answer,
        explanation: L("Аргумент b не передан — берётся значение по умолчанию " + d +
          ", поэтому " + mul + " × " + d + " = " + val + ".",
          "The argument b is not passed, so its default " + d +
          " is used: " + mul + " × " + d + " = " + val + ".") };
    },
    // 26. Изменение списка в цикле
    () => {
      // Числа пишем БЕЗ кавычек: pyList оборачивает в строки, и тогда
      // вместо квадратов получается склейка символов.
      const src = shuffle([2, 3, 4, 5, 6, 7]).slice(0, 4);
      const pyNums = (a) => "[" + a.join(", ") + "]";
      const correct = pyNums(src.map((x) => x * x));
      const q = mcOptions(correct, [
        pyNums(src.map((x) => x + 1)),
        pyNums(src.map((x) => x * 2)),
        pyNums(src.slice(1).concat([src[0]]).map((x) => x * x))
      ], (i) => pyNums(src.slice(i).concat(src.slice(0, i)).map((x) => x * x)));
      return { topic: "collections", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "a = " + pyNums(src) + "\nfor i in range(len(a)):\n    a[i] = a[i] * a[i]\nprint(a)",
        options: q.options, answer: q.answer,
        explanation: L("Изменение элемента на месте меняет сам список — все числа возводятся в квадрат.",
          "Changing an item in place changes the list itself — every number is squared.") };
    },
    // 27. Итерация по enumerate
    () => {
      const src = shuffle(WEAPON.slice()).slice(0, 4);
      const which = rnd(0, 3);
      const correct = src[which] + " " + (which + 1);
      const q = mcOptions(correct, src.filter((_, i) => i !== which)
        .map((w) => w + " " + (which + 1)),
        (i) => src[which] + " " + (which + 1 + i));
      return { topic: "collections", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "for i, x in enumerate(" + pyList(src) + ", 1):\n    if i == " + (which + 1) + ":\n        print(x, i)",
        options: q.options, answer: q.answer,
        explanation: L("enumerate даёт пары «элемент, номер». Нумерация с 1: «" +
          src[which] + "» имеет номер " + (which + 1) + ".",
          "enumerate yields pairs of “item, number”. Numbering starts at 1: “" +
          src[which] + "” is number " + (which + 1) + ".") };
    },
    // 28. Модуль и точка
    () => {
      const d = rnd(2, 6);
      // math.sqrt всегда возвращает float: 6.0, а не 6. Ответ должен
      // совпадать с тем, что напечатает настоящий Python.
      const correct = d + ".0";
      const q = mcOptions(correct, [String(d + 1), String(d * 2), (d + 1) + ".0"],
        (i) => (d + i) + ".0");
      return { topic: "modules", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "import math\nprint(math.sqrt(" + d * d + "))",
        options: q.options, answer: q.answer,
        explanation: L("math.sqrt(" + d * d + ") = " + d +
          ", и это число типа float — поэтому печатается «" + correct + "».",
          "math.sqrt(" + d * d + ") = " + d +
          ", and that is a float — so it prints “" + correct + "”.") };
    },
    // 29. Именованный аргумент и порядок
    () => {
      const a = rnd(2, 6), b = rnd(7, 12);
      const val = a * b;
      const q = options(val, [a + b, b - a, a * b + 1].concat(numWrongs(val)), (i) => val + i);
      return { topic: "functions", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "def box(w, h):\n    return w * h\n\nprint(box(h=" + b + ", w=" + a + "))",
        options: q.options, answer: q.answer,
        explanation: L("Имена аргументов разрешают передавать их в любом порядке: " +
          a + " × " + b + " = " + val + ".",
          "Named arguments may be passed in any order: " +
          a + " × " + b + " = " + val + ".") };
    },
    // 30. Условное выражение
    () => {
      const a = rnd(3, 20), b = rnd(3, 20);
      const up = a > b;
      const correct = String(up ? a : b);
      const q = mcOptions(correct, [String(up ? b : a), String(a + b), String(Math.abs(a - b))],
        (i) => String(Math.max(a, b) + i));
      return { topic: "operators", level: 4, text: L("Что выведет этот код?", "What will this code print?"),
        code: "a = " + a + "\nb = " + b + "\nprint(a if a > b else b)",
        options: q.options, answer: q.answer,
        explanation: L("Тернарное выражение берёт " + (up ? "a" : "b") +
          ", потому что " + (up ? a + " > " + b : a + " ≤ " + b) + ".",
          "The conditional expression picks " + (up ? "a" : "b") +
          ", because " + (up ? a + " > " + b : a + " ≤ " + b) + ".") };
    }
  ];

  function makeVariant(seq) {
    const q = pick(TEMPLATES)();
    q.id = "g" + seq;
    q.generated = true;
    return q;
  }

  // Индексы 18.. — это 12 строгих шаблонов четвёртого уровня.
  const HARD_FROM = 18;

  function generate(count) {
    const out = [];
    const seen = {};
    let guard = 0;
    while (out.length < count && guard++ < count * 30) {
      const q = makeVariant(out.length + 1);
      if (seen[q.code]) continue;
      seen[q.code] = true;
      out.push(q);
    }
    return out;
  }

  // Дополнительный пул строгих вопросов: генерируем, пока не наберём
  // нужное количество уникальных заданий четвёртого уровня.
  function generateHard(count) {
    const hard = [];
    const seen = {};
    let guard = 0;
    while (hard.length < count && guard++ < count * 40) {
      const q = pick(TEMPLATES.slice(HARD_FROM))();
      if (q.level !== 4) continue;
      if (seen[q.code]) continue;
      seen[q.code] = true;
      q.id = "h" + (hard.length + 1);
      q.generated = true;
      q.hard = true;
      hard.push(q);
    }
    return hard;
  }

  if (typeof QUESTIONS !== "undefined" && Array.isArray(QUESTIONS)) {
    for (const q of generate(96)) QUESTIONS.push(q);
    // Нижние этажи (qmin: 4) получают собственный запас строгих заданий.
    for (const q of generateHard(72)) QUESTIONS.push(q);
    // Генератор иногда повторяет авторский вопрос или другой
    // сгенерированный. Оставляем первый вариант: дубль в выборе — это
    // потерянный ход, а не разнообразие. Авторские вопросы не трогаем.
    const seen = new Set();
    const keyOf = (q) => String(q.text || "") + "|" + String(q.code || "");
    QUESTIONS.forEach((q) => { if (!q.generated) seen.add(keyOf(q)); });
    for (let i = 0; i < QUESTIONS.length; ) {
      const q = QUESTIONS[i];
      if (!q.generated) { i += 1; continue; }
      const key = keyOf(q);
      if (seen.has(key)) {
        QUESTIONS.splice(i, 1);
        continue;
      }
      seen.add(key);
      i += 1;
    }
  }

  // Перемешивает варианты ответа. Возвращает новый порядок:
  // options — перемешанные варианты, answer — новый индекс правильного,
  // order — соответствие новым индексам исходных.
  function shuffleChoices(options, answer) {
    const order = options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = order[i];
      order[i] = order[j];
      order[j] = t;
    }
    return {
      options: order.map((i) => options[i]),
      answer: order.indexOf(answer),
      order: order
    };
  }

  if (typeof window !== "undefined") {
    window.shuffleChoices = shuffleChoices;
    window.QuestionVariants = { generate: generate, templates: TEMPLATES.length, shuffleChoices: shuffleChoices };
  }
})();
