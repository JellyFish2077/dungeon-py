// Генератор практических заданий подземелья: «вставь пропущенное», «найди
// ошибку», «повтори код» и «напиши функцию». В банке code-tasks.js таких
// заданий 46, и за долгий поход (три-четыре урока) они шли по кругу: одно и
// то же задание выпадало по восемь-десять раз, на тему «Синтаксис» их было
// три, а на «Модули» — ни одного. Здесь каждое задание — шаблон: имена,
// числа и предметы меняются при каждом вызове, и у каждой темы есть задания
// тех уровней, которые просят этажи.
//
// Шаблон знает, что должно получиться: expect — что напечатает верный код,
// raises — какую ошибку бросит код с ошибкой, fix — исправленный код,
// solution — эталонное решение «напиши функцию». Игре эти поля не нужны: их
// читает verify_practice.py и прогоняет варианты через настоящий Python —
// верный ответ работает, неверные нет, эталон проходит проверки.
//
// Задания создаются по требованию (PracticeVariants.make), при загрузке
// страницы генератор ничего не делает.
(function () {
  "use strict";

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  };
  // n разных элементов arr в случайном порядке.
  const sample = (arr, n) => shuffle(arr.slice()).slice(0, n);
  const distinct = (arr) => new Set(arr.map(String)).size === arr.length;

  // Язык шаблона: русская версия берёт первый аргумент, английская —
  // второй. Имя T, потому что L уже занято сборкой строк кода.
  const EN = typeof window !== "undefined" &&
    ((window.PyI18n && window.PyI18n.language === "en") || window.__PYQUIZ_LANG === "en");
  const T = (ru, en) => (EN ? en : ru);

  // Код задания собирается построчно.
  const L = (...rows) => rows.join("\n");
  // Строка Python в двойных кавычках.
  const str = (s) => '"' + s + '"';
  // Список строк так, как он записан в коде, и так, как его печатает Python.
  const strList = (arr) => "[" + arr.map(str).join(", ") + "]";
  const shownList = (arr) => "[" + arr.map((s) => "'" + s + "'").join(", ") + "]";
  const numList = (arr) => "[" + arr.join(", ") + "]";
  // Дробное число так, как его печатает Python: 5.0, а не 5.
  const pyFloat = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
  // Что напечатает программа — прямо в коде. Без этого у «вставь
  // пропущенное» бывает два рабочих ответа, а нужен ровно один.
  const says = (s) => "  # " + T("выведет: ", "prints: ") + s;
  // Что должна была напечатать программа с ошибкой в логике.
  const wants = (s) => "  # " + T("нужно получить: ", "should print: ") + s;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  // Слово после числа: 1 шаг, 3 шага, 5 шагов.
  const plural = (n, one, few, many) => {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };
  // Английское число: 1 step, 3 steps.
  const pluralEn = (n, one, many) => (n === 1 ? one : many);

  const HEROES = T(["Маг", "Рыцарь", "Лучник", "Воин", "Друид", "Странник"],
    ["Mage", "Knight", "Archer", "Warrior", "Druid", "Wanderer"]);
  // Все слова длиннее двух букв: шаблоны со словарями рассчитывают, что
  // ключ не распакуется в две переменные.
  const MONSTERS = T(["гоблин", "скелет", "тролль", "зомби", "призрак", "дракон", "вампир", "голем", "паук", "орк"],
    ["goblin", "skeleton", "troll", "zombie", "ghost", "dragon", "vampire", "golem", "spider", "orc"]);
  const ITEMS = T(["меч", "щит", "лук", "факел", "ключ", "топор", "свиток", "зелье", "кирка", "посох", "плащ", "шлем"],
    ["sword", "torch", "staff", "cloak", "axe", "bow", "key", "gem",
      "map", "orb", "rod", "cup", "hat", "rune", "coin", "helm"]);
  // Для списков в коде — короткие слова: на телефоне в строку кода влезает
  // около 40 знаков, и длинный список уезжал за край.
  const SHORT_ITEMS = ITEMS.filter((w) => w.length <= 4);
  const NUMVARS = ["hp", "gold", "mana", "arrows", "keys", "xp", "armor", "power"];

  const TEMPLATES = [];
  function add(kind, topic, level, name, title, make) {
    TEMPLATES.push({
      key: kind + "." + topic + "." + name,
      kind: kind,
      topic: topic,
      level: level,
      title: title,
      make: make
    });
  }
  // Вариант fill и error: options[0] — верный ответ, игра перемешивает сама.
  const fill = (topic, level, name, title, make) => add("fill", topic, level, name, title, make);
  const bug = (topic, level, name, title, make) => add("error", topic, level, name, title, make);
  const copy = (topic, level, name, title, make) => add("copy", topic, level, name, title, make);

  // ================= Синтаксис и основы =================

  fill("syntax", 1, "print_var", T("Выведи переменную", "Print the variable"), () => {
    const v = pick([["hero", HEROES], ["weapon", ITEMS], ["monster", MONSTERS]]);
    const name = v[0];
    const value = pick(v[1]);
    return {
      code: L(`${name} = ${str(value)}`, "print(___)" + says(value)),
      options: [name, str(name), cap(name), "print"],
      expect: value,
      explanation: T(
        `Имя переменной пишут без кавычек: print(${name}) выводит её значение «${value}». ` +
          `А ${str(name)} в кавычках — просто слово ${name}.`,
        `A variable name is written without quotes: print(${name}) prints its value “${value}”. ` +
          `And ${str(name)} in quotes is just the word ${name}.`)
    };
  });

  fill("syntax", 1, "assign", T("Запиши значение", "Store a value"), () => {
    const name = pick(NUMVARS);
    const value = rnd(3, 99);
    return {
      code: L(`${name} ___ ${value}`, `print(${name})` + says(value)),
      options: ["=", "==", "->", ":="],
      expect: String(value),
      explanation: T(`Один знак = записывает значение в переменную: ${name} = ${value}. ` +
        "Два знака == только сравнивают и ничего не записывают.",
        `A single = stores a value in the variable: ${name} = ${value}. ` +
        "Two signs == only compare and store nothing.")
    };
  });

  fill("syntax", 1, "comment", T("Заметка на полях", "A note in the margin"), () => {
    const note = pick(T(["здесь начинается бой", "герой входит в пещеру", "считаем золото", "заметка для себя"],
      ["the fight starts here", "the hero enters the cave", "counting the gold", "a note to myself"]));
    const msg = pick(T(["Вперёд!", "В бой!", "Готов!", "Факел зажжён"],
      ["Forward!", "To battle!", "Ready!", "The torch is lit"]));
    return {
      code: L(`___ ${note}`, `print(${str(msg)})` + says(msg)),
      options: ["#", "//", "--", "/*"],
      expect: msg,
      explanation: T("Комментарий в Python начинается с #: всё, что дальше до конца строки, Python пропускает. " +
        "// и /* — комментарии других языков.",
        "A Python comment starts with #: everything after it to the end of the line is skipped. " +
        "// and /* are comments in other languages.")
    };
  });

  fill("syntax", 1, "print_two", T("Два значения в одной строке", "Two values on one line"), () => {
    const a = pick(["hp", "gold", "level"]);
    const b = pick(["mana", "keys", "arrows"]);
    const x = rnd(10, 90);
    const y = rnd(2, 9);
    return {
      code: L(`${a} = ${x}`, `${b} = ${y}`, `print(${a} ___ ${b})` + says(x + " " + y)),
      options: [",", "+", "and", "-"],
      expect: x + " " + y,
      explanation: T(`Значения в print перечисляют через запятую, а Python ставит между ними пробел: ${x} ${y}. ` +
        "Знак + сложил бы числа.",
        `Values in print are separated by commas, and Python puts a space between them: ${x} ${y}. ` +
        "A + sign would add the numbers.")
    };
  });

  fill("syntax", 2, "case", T("Два похожих имени", "Two similar names"), () => {
    const names = sample(HEROES, 2);
    const base = pick(["hero", "name", "boss"]);
    return {
      code: L(`${cap(base)} = ${str(names[0])}`, `${base} = ${str(names[1])}`, "print(___)" + says(names[0])),
      options: [cap(base), base, str(base), base.toUpperCase()],
      expect: names[0],
      explanation: T(`Python различает регистр: ${cap(base)} и ${base} — две разные переменные. ` +
        `«${names[0]}» лежит в ${cap(base)}.`,
        `Python is case-sensitive: ${cap(base)} and ${base} are two different variables. ` +
        `“${names[0]}” is stored in ${cap(base)}.`)
    };
  });

  bug("syntax", 1, "open_quote", T("Свиток не читается", "The scroll won't open"), () => {
    const msg = pick(T(["Привет, путник", "В бой", "Сундук открыт", "Дверь заперта"],
      ["Hello, traveller", "To battle", "The chest is open", "The door is locked"]));
    return {
      code: `print("${msg})`,
      options: T([
        "Строка не закрыта: в конце не хватает кавычки",
        "Скобка в конце лишняя",
        "Слово print написано с ошибкой",
        "Текст нельзя печатать через print"
      ], [
        "The string is not closed: the closing quote is missing",
        "The bracket at the end is extra",
        "The word print is misspelled",
        "Text cannot be printed with print"
      ]),
      raises: "SyntaxError",
      fix: `print("${msg}")`,
      explanation: T(`Строка начинается с кавычки и должна ей же заканчиваться: print("${msg}").`,
        `A string starts with a quote and must end with one: print("${msg}").`)
    };
  });

  bug("syntax", 1, "open_paren", T("Счётчик сломался", "The counter broke"), () => {
    const v = pick(NUMVARS);
    const n = rnd(5, 50);
    const k = rnd(2, 9);
    return {
      code: L(`${v} = ${n}`, `print(${v} + ${k}`),
      options: T([
        "Не закрыта скобка у print(",
        "Число нельзя прибавлять к переменной",
        `Имя ${v} нужно взять в кавычки`,
        "В конце строки нужно двоеточие"
      ], [
        "The bracket after print( is not closed",
        "A number cannot be added to a variable",
        `The name ${v} must be in quotes`,
        "The line needs a colon at the end"
      ]),
      raises: "SyntaxError",
      fix: L(`${v} = ${n}`, `print(${v} + ${k})`),
      explanation: T(`Каждая открытая скобка должна закрыться: print(${v} + ${k}).`,
        `Every opening bracket must be closed: print(${v} + ${k}).`)
    };
  });

  bug("syntax", 1, "big_print", T("Заклинание не срабатывает", "The spell fizzles"), () => {
    const msg = pick(T(["В бой!", "Привет!", "Сундук!", "Ура!"],
      ["To battle!", "Hello!", "A chest!", "Hooray!"]));
    const wrong = pick(["Print", "PRINT"]);
    return {
      code: `${wrong}(${str(msg)})`,
      options: T([
        `${wrong} написано ${wrong === "PRINT" ? "большими буквами" : "с большой буквы"}: Python различает регистр, нужно print`,
        "В конце строки не хватает точки с запятой",
        "Текст нужно писать без кавычек",
        "Восклицательный знак нельзя печатать"
      ], [
        `${wrong} is written ${wrong === "PRINT" ? "in capitals" : "with a capital letter"}: Python is case-sensitive, it must be print`,
        "The line needs a semicolon at the end",
        "The text must be written without quotes",
        "An exclamation mark cannot be printed"
      ]),
      raises: "NameError",
      fix: `print(${str(msg)})`,
      explanation: T(`Для Python print и ${wrong} — разные имена. Функция вывода пишется маленькими буквами: print.`,
        `For Python, print and ${wrong} are different names. The print function is written in lowercase: print.`)
    };
  });

  bug("syntax", 1, "before_assign", T("Пустой счётчик", "Empty counter"), () => {
    const v = pick(NUMVARS);
    const n = rnd(10, 100);
    return {
      code: L(`print(${v})`, `${v} = ${n}`),
      options: T([
        `Переменную ${v} печатают раньше, чем ей дали значение`,
        `Число ${n} нужно взять в кавычки`,
        `Переменную нельзя называть ${v}`,
        "print не может стоять первой строкой"
      ], [
        `The variable ${v} is printed before it gets a value`,
        `The number ${n} must be in quotes`,
        `A variable cannot be called ${v}`,
        "print cannot be the first line"
      ]),
      raises: "NameError",
      fix: L(`${v} = ${n}`, `print(${v})`),
      explanation: T(`Python выполняет строки сверху вниз. На первой строке переменной ${v} ещё нет: ` +
        `сначала ${v} = ${n}, потом print(${v}).`,
        `Python runs lines from top to bottom. On the first line ${v} does not exist yet: ` +
          `first ${v} = ${n}, then print(${v}).`)
    };
  });

  bug("syntax", 1, "space_name", T("Дневник героя", "The hero's diary"), () => {
    const pair = pick([["max", "hp"], ["hero", "name"], ["gold", "bag"], ["magic", "power"]]);
    const n = rnd(10, 99);
    return {
      code: L(`${pair[0]} ${pair[1]} = ${n}`, `print(${pair[0]} ${pair[1]})`),
      options: T([
        `В имени переменной не бывает пробела: нужно ${pair[0]}_${pair[1]}`,
        "Нужно два знака ==",
        `Число ${n} нужно взять в кавычки`,
        "print нельзя писать после присваивания"
      ], [
        `A variable name cannot contain a space: it must be ${pair[0]}_${pair[1]}`,
        "You need two signs ==",
        `The number ${n} must be in quotes`,
        "print cannot follow an assignment"
      ]),
      raises: "SyntaxError",
      fix: L(`${pair[0]}_${pair[1]} = ${n}`, `print(${pair[0]}_${pair[1]})`),
      explanation: T(`Имя переменной — одно слово без пробелов. Слова соединяют подчёркиванием: ${pair[0]}_${pair[1]}.`,
        `A variable name is one word without spaces. Words are joined with an underscore: ${pair[0]}_${pair[1]}.`)
    };
  });

  bug("syntax", 2, "digit_name", T("Второй герой", "The second hero"), () => {
    const hero = pick(HEROES);
    const name = pick(["2hero", "1hero", "2nd_hero"]);
    return {
      code: L(`${name} = ${str(hero)}`, `print(${name})`),
      options: T([
        "Имя переменной не может начинаться с цифры",
        "Строку нужно писать в одинарных кавычках",
        "В одном имени нельзя смешивать буквы и цифры",
        "Сначала нужно вызвать print, а потом присваивать"
      ], [
        "A variable name cannot start with a digit",
        "The string must use single quotes",
        "One name cannot mix letters and digits",
        "print must be called before the assignment"
      ]),
      raises: "SyntaxError",
      fix: L(`hero2 = ${str(hero)}`, "print(hero2)"),
      explanation: T("Имя переменной начинается с буквы или подчёркивания. Цифры можно ставить дальше: hero2 — правильное имя.",
        "A variable name starts with a letter or an underscore. Digits may follow: hero2 is a valid name.")
    };
  });

  bug("syntax", 2, "extra_indent", T("Кривой свиток", "The crooked scroll"), () => {
    const v = pick(NUMVARS);
    const n = rnd(5, 60);
    return {
      code: L(`${v} = ${n}`, `    print(${v})`),
      options: T([
        "Лишний отступ перед print: здесь нет блока, которому он нужен",
        `После ${v} = ${n} не хватает двоеточия`,
        `Переменная ${v} не задана`,
        "print нельзя писать после присваивания"
      ], [
        "The indentation before print is extra: there is no block that needs it",
        `A colon is missing after ${v} = ${n}`,
        `The variable ${v} is not defined`,
        "print cannot follow an assignment"
      ]),
      raises: "IndentationError",
      fix: L(`${v} = ${n}`, `print(${v})`),
      explanation: T("Отступ в Python — часть синтаксиса: он нужен только внутри блока (после if, for, def). " +
        "Обычные строки пишут от края.",
        "Indentation in Python is part of the syntax: it is only needed inside a block (after if, for, def). " +
        "Ordinary lines start at the edge.")
    };
  });

  bug("syntax", 2, "case_var", T("Пропавшее значение", "The missing value"), () => {
    const v = pick([["weapon", ITEMS], ["hero", HEROES], ["monster", MONSTERS]]);
    const value = pick(v[1]);
    return {
      code: L(`${v[0]} = ${str(value)}`, `print(${cap(v[0])})`),
      options: T([
        `${cap(v[0])} и ${v[0]} — разные имена: Python различает регистр`,
        "Строку нельзя хранить в переменной",
        "Нужны одинарные кавычки",
        "print здесь не нужен"
      ], [
        `${cap(v[0])} and ${v[0]} are different names: Python is case-sensitive`,
        "A string cannot be stored in a variable",
        "Single quotes are required",
        "print is not needed here"
      ]),
      raises: "NameError",
      fix: L(`${v[0]} = ${str(value)}`, `print(${v[0]})`),
      explanation: T(`Python различает большие и маленькие буквы: переменная называется ${v[0]}, а ${cap(v[0])} он не знает.`,
        `Python distinguishes uppercase and lowercase: the variable is called ${v[0]}, and it does not know ${cap(v[0])}.`)
    };
  });

  copy("syntax", 1, "two_vars", T("Заводим героя", "Creating a hero"), () => {
    const a = pick(["hp", "gold", "level"]);
    const b = pick(["mana", "keys", "arrows"]);
    return {
      code: L(`${a} = ${rnd(10, 100)}`, `${b} = ${rnd(1, 20)}`, `print(${a}, ${b})`),
      explanation: T(`Две переменные получают значения, а print(${a}, ${b}) выводит оба через пробел.`,
        `Two variables get values, and print(${a}, ${b}) prints both separated by a space.`)
    };
  });

  copy("syntax", 1, "comment_hello", T("Первое заклинание", "The first spell"), () => {
    const note = pick(T(["# приветствие героя", "# герой входит в пещеру", "# моя первая программа"],
      ["# greeting the hero", "# the hero enters the cave", "# my first program"]));
    return {
      code: L(note, `name = ${str(pick(HEROES))}`, T('print("Привет,", name)', 'print("Hello,", name)')),
      explanation: T("Строка с # — комментарий, Python её пропускает. print выводит текст и значение переменной через пробел.",
        "A line starting with # is a comment; Python skips it. print outputs text and a variable value separated by a space.")
    };
  });

  fill("syntax", 3, "f_string", T("Строка с подстановкой", "A string with substitution"), () => {
    const v = pick(NUMVARS);
    const n = rnd(10, 99);
    const want = cap(v) + ": " + n;
    return {
      code: L(`${v} = ${n}`, `print(f"${cap(v)}: {___}")` + says(want)),
      options: [v, cap(v), "print", "type(" + v + ")"],
      expect: want,
      explanation: T(`В f-строке фигурные скобки — подстановка: {${v}} заменяется значением ${n}. ` +
        "Без скобок имя выведется словом, а с заглавной буквы Python такого имени не знает.",
        `In an f-string the braces substitute a value: {${v}} is replaced by ${n}. ` +
        "Without braces the name is printed as a word, and Python does not know the capitalised name.")
    };
  });

  // ================= Типы данных =================

  fill("types", 1, "to_int", T("Строка в число", "String to number"), () => {
    const n = rnd(10, 60);
    const k = rnd(2, 9);
    const v = pick(["coins", "age", "level", "arrows"]);
    return {
      code: L(`${v} = ___(${str(n)})`, `print(${v} + ${k})` + says(n + k)),
      options: ["int", "str", "len", "list"],
      expect: String(n + k),
      explanation: T(`int("${n}") превращает строку в число ${n}, и его уже можно складывать: ${n} + ${k} = ${n + k}.`,
        `int("${n}") turns the string into the number ${n}, and it can be added: ${n} + ${k} = ${n + k}.`)
    };
  });

  fill("types", 1, "to_str", T("Число в строку", "Number to string"), () => {
    const v = pick(T([["gold", "Золото: "], ["hp", "Здоровье: "], ["xp", "Опыт: "]],
      [["gold", "Gold: "], ["hp", "Health: "], ["xp", "XP: "]]));
    const n = rnd(5, 200);
    return {
      code: L(`${v[0]} = ${n}`, `print(${str(v[1])} + ___(${v[0]}))` + says(v[1] + n)),
      options: ["str", "int", "float", "len"],
      expect: v[1] + n,
      explanation: T(`Склеивать через + можно только строки, поэтому число сначала превращают в строку: str(${v[0]}).`,
        `Only strings can be joined with +, so the number is turned into a string first: str(${v[0]}).`)
    };
  });

  fill("types", 2, "to_float", T("Дробная цена", "A fractional price"), () => {
    const x = pick([0.5, 1.5, 2.5, 3.5, 4.5, 1.25, 2.25]);
    const k = pick([2, 4]);
    const s = String(x);
    return {
      code: L("price = float(___)", `print(price * ${k})` + says(pyFloat(x * k))),
      options: [str(s), str(s.replace(".", ",")), str(s + T(" монеты", " coins")), s + ".0"],
      expect: pyFloat(x * k),
      explanation: T(`Дробную часть в Python отделяют точкой: float("${s}") — это ${s}. ` +
        `Строку с запятой "${s.replace(".", ",")}" float не поймёт.`,
        `In Python the fractional part is separated by a dot: float("${s}") is ${s}. ` +
        `A string with a comma, "${s.replace(".", ",")}", is not understood by float.`)
    };
  });

  fill("types", 2, "type_of", T("Какого типа значение", "What type is the value"), () => {
    const n = rnd(2, 99);
    const v = pick(T([
      { cls: "int", right: `${n}`, wrong: [`${n}.0`, str(n), `[${n}]`], why: "Целое число без точки — int." },
      { cls: "float", right: `${n}.5`, wrong: [`${n}`, str(n + ".5"), `[${n}.5]`], why: "Число с точкой — дробное, float." },
      { cls: "str", right: str(n), wrong: [`${n}`, `${n}.0`, `[${n}]`], why: "Всё, что в кавычках, — строка str, даже цифры." },
      { cls: "bool", right: pick(["True", "False"]), wrong: [str("True"), "1", "None"], why: "True и False — логический тип bool." },
      { cls: "list", right: `[${n}]`, wrong: [`${n}`, str(`[${n}]`), `(${n})`], why: "Квадратные скобки — список list. Круглые скобки вокруг числа ничего не меняют." }
    ], [
      { cls: "int", right: `${n}`, wrong: [`${n}.0`, str(n), `[${n}]`], why: "A whole number without a dot is int." },
      { cls: "float", right: `${n}.5`, wrong: [`${n}`, str(n + ".5"), `[${n}.5]`], why: "A number with a dot is a float." },
      { cls: "str", right: str(n), wrong: [`${n}`, `${n}.0`, `[${n}]`], why: "Anything in quotes is a str, even digits." },
      { cls: "bool", right: pick(["True", "False"]), wrong: [str("True"), "1", "None"], why: "True and False are the boolean type bool." },
      { cls: "list", right: `[${n}]`, wrong: [`${n}`, str(`[${n}]`), `(${n})`], why: "Square brackets make a list. Round brackets around a number change nothing." }
    ]));
    return {
      code: "print(type(___))" + says(`<class '${v.cls}'>`),
      options: [v.right].concat(v.wrong),
      expect: `<class '${v.cls}'>`,
      explanation: T("type() показывает тип значения. ", "type() shows the type of a value. ") + v.why
    };
  });

  fill("types", 2, "round", T("Округли урон", "Round the damage"), () => {
    const whole = rnd(2, 30);
    const x = whole + "." + pick([6, 7, 8, 9]);
    return {
      code: `print(___(${x}))` + says(whole + 1),
      options: ["round", "int", "float", "str"],
      expect: String(whole + 1),
      explanation: T(`round() округляет до ближайшего целого: ${x} → ${whole + 1}. ` +
        `А int() просто отбрасывает дробную часть и дал бы ${whole}.`,
        `round() rounds to the nearest whole number: ${x} → ${whole + 1}. ` +
        `int() simply drops the fractional part and would give ${whole}.`)
    };
  });

  fill("types", 3, "truthy", T("Истина или ложь", "Truth or falsehood"), () => {
    const v = pick(T([
      { want: "False", right: "0", wrong: ["1", str("0"), "-1"],
        why: "Ноль — ложь, любое другое число — истина. А \"0\" в кавычках — непустая строка, тоже истина." },
      { want: "False", right: str(""), wrong: [str(" "), str("False"), str("0")],
        why: "Ложна только пустая строка \"\". Даже строка из пробела или из слова False — истина." },
      { want: "False", right: "[]", wrong: ["[0]", str("[]"), "[[]]"],
        why: "Пустой список [] — ложь. Список [0] не пустой: в нём есть элемент." },
      { want: "True", right: str("0"), wrong: ["0", str(""), "[]"],
        why: "Строка \"0\" не пустая, поэтому она истина. Ложь — это 0, пустая строка и пустой список." }
    ], [
      { want: "False", right: "0", wrong: ["1", str("0"), "-1"],
        why: "Zero is false, any other number is true. \"0\" in quotes is a non-empty string, so it is true too." },
      { want: "False", right: str(""), wrong: [str(" "), str("False"), str("0")],
        why: "Only the empty string \"\" is false. Even a single space or the word False is true." },
      { want: "False", right: "[]", wrong: ["[0]", str("[]"), "[[]]"],
        why: "An empty list [] is false. The list [0] is not empty: it has one item." },
      { want: "True", right: str("0"), wrong: ["0", str(""), "[]"],
        why: "The string \"0\" is not empty, so it is true. False values are 0, an empty string and an empty list." }
    ]));
    return {
      code: "print(bool(___))" + says(v.want),
      options: [v.right].concat(v.wrong),
      expect: v.want,
      explanation: v.why
    };
  });

  fill("types", 4, "isinstance", T("Проверка типа", "Type check"), () => {
    const n = rnd(2, 99);
    const item = pick(ITEMS);
    const v = pick([
      { cls: "int", right: `${n}`, wrong: [str(n), `${n}.0`, `[${n}]`] },
      { cls: "str", right: str(item), wrong: [`${n}`, `[${str(item)}]`, "None"] },
      { cls: "float", right: `${n}.5`, wrong: [`${n}`, str(n + ".5"), `[${n}.5]`] },
      { cls: "list", right: `[${n}]`, wrong: [`${n}`, str(`[${n}]`), `(${n})`] }
    ]);
    return {
      code: `print(isinstance(___, ${v.cls}))` + says("True"),
      options: [v.right].concat(v.wrong),
      expect: "True",
      explanation: T(`isinstance(x, ${v.cls}) отвечает True, только если x — значение типа ${v.cls}.`,
        `isinstance(x, ${v.cls}) answers True only if x is a value of type ${v.cls}.`)
    };
  });

  bug("types", 2, "str_plus_int", T("Счёт не печатается", "The score won't print"), () => {
    const v = pick(T([["gold", "Золото: "], ["hp", "Здоровье: "], ["xp", "Опыт: "]],
      [["gold", "Gold: "], ["hp", "Health: "], ["xp", "XP: "]]));
    const n = rnd(5, 99);
    return {
      code: L(`${v[0]} = ${n}`, `print(${str(v[1])} + ${v[0]})`),
      options: T([
        `Нельзя складывать строку и число: нужно str(${v[0]})`,
        `Переменная ${v[0]} не задана`,
        "Строку нужно взять в одинарные кавычки",
        "print не умеет печатать числа"
      ], [
        `A string and a number cannot be added: it must be str(${v[0]})`,
        `The variable ${v[0]} is not defined`,
        "The string must use single quotes",
        "print cannot print numbers"
      ]),
      raises: "TypeError",
      fix: L(`${v[0]} = ${n}`, `print(${str(v[1])} + str(${v[0]}))`),
      explanation: T(`Строку и число сложить нельзя: Python не знает, что из них получить. Число превращают в строку: str(${v[0]}).`,
        `A string and a number cannot be added: Python does not know what to make of them. The number is turned into a string: str(${v[0]}).`)
    };
  });

  bug("types", 2, "int_word", T("Уровень словами", "Level in words"), () => {
    const pair = pick(T([["пять", 5], ["десять", 10], ["три", 3], ["сто", 100]],
      [["five", 5], ["ten", 10], ["three", 3], ["hundred", 100]]));
    const v = pick(["level", "gold", "arrows"]);
    return {
      code: L(`${v} = int(${str(pair[0])})`, `print(${v})`),
      options: T([
        `int() не понимает слова: нужна строка из цифр, например "${pair[1]}"`,
        "int пишется с большой буквы",
        "Строку нельзя передавать в функцию",
        "Не хватает закрывающей скобки"
      ], [
        `int() does not understand words: it needs a string of digits, for example "${pair[1]}"`,
        "int is written with a capital letter",
        "A string cannot be passed to a function",
        "The closing bracket is missing"
      ]),
      raises: "ValueError",
      fix: L(`${v} = int(${str(pair[1])})`, `print(${v})`),
      explanation: T(`int() превращает в число только строку из цифр: int("${pair[1]}") = ${pair[1]}. ` +
        `Слово «${pair[0]}» он не поймёт — будет ValueError.`,
        `int() only converts a string of digits: int("${pair[1]}") = ${pair[1]}. ` +
        `It cannot understand the word “${pair[0]}” — that raises ValueError.`)
    };
  });

  bug("types", 3, "str_times_float", T("Слишком громкий клич", "Too loud a cry"), () => {
    const w = pick(T(["ха", "ур", "бум"], ["ha", "hur", "boom"]));
    const k = pick(["2.5", "1.5", "3.0"]);
    return {
      code: L(`cry = ${str(w)} * ${k}`, "print(cry)"),
      options: T([
        "Строку можно умножать только на целое число",
        "Строку вообще нельзя умножать",
        "Нужны одинарные кавычки",
        "Переменную нельзя называть cry"
      ], [
        "A string can only be multiplied by a whole number",
        "A string cannot be multiplied at all",
        "Single quotes are required",
        "A variable cannot be called cry"
      ]),
      raises: "TypeError",
      fix: L(`cry = ${str(w)} * ${parseInt(k, 10)}`, "print(cry)"),
      explanation: T(`Строка, умноженная на целое число, повторяется: ${str(w)} * 2 — это «${w}${w}». ` +
        "На дробное число умножить нельзя, даже на 3.0.",
        `A string multiplied by a whole number repeats: ${str(w)} * 2 is “${w}${w}”. ` +
        "A fractional number cannot be used, not even 3.0.")
    };
  });

  bug("types", 3, "len_of_int", T("Сколько цифр", "How many digits"), () => {
    const n = rnd(100, 9999);
    return {
      code: L(`gold = ${n}`, "print(len(gold))"),
      options: T([
        "У числа нет длины: len() работает со строками и списками",
        "Число слишком большое для len()",
        "Нужно писать length вместо len",
        "Переменную gold нельзя печатать"
      ], [
        "A number has no length: len() works with strings and lists",
        "The number is too big for len()",
        "You must write length instead of len",
        "The variable gold cannot be printed"
      ]),
      raises: "TypeError",
      fix: L(`gold = ${n}`, "print(len(str(gold)))"),
      explanation: T("len() считает элементы строки или списка, а у числа их нет. " +
        "Чтобы узнать, сколько в числе цифр, его сначала превращают в строку: len(str(gold)).",
        "len() counts the items of a string or a list, and a number has none. " +
        "To count the digits of a number, turn it into a string first: len(str(gold)).")
    };
  });

  bug("types", 3, "str_compare", T("Возраст из input()", "Age from input()"), () => {
    const n = rnd(12, 40);
    const lim = rnd(10, 18);
    if (!EN) {
      return {
        code: L(`age = ${str(n)}  # так возвращает input()`, `if age > ${lim}:`, '    print("Проходи")'),
        options: [
          `Строку "${n}" сравнивают с числом: нужно int(age)`,
          "После if двоеточие не ставят",
          "input() всегда возвращает число",
          "Знак > в Python пишут как =>"
        ],
        raises: "TypeError",
        fix: L(`age = ${str(n)}  # так возвращает input()`, `if int(age) > ${lim}:`, '    print("Проходи")'),
        explanation: "input() всегда возвращает строку. Строку с числом сравнить нельзя — сначала int(age)."
      };
    }
    return {
      code: L(`age = ${str(n)}  # from input()`, `if age > ${lim}:`, '    print("Pass")'),
      options: [
        `The string "${n}" is compared with a number: it must be int(age)`,
        "There is no colon after if",
        "input() always returns a number",
        "> is written as => in Python"
      ],
      raises: "TypeError",
      fix: L(`age = ${str(n)}  # from input()`, `if int(age) > ${lim}:`, '    print("Pass")'),
      explanation: "input() always returns a string. A string cannot be compared with a number — use int(age) first."
    };
  });

  copy("types", 2, "convert", T("Монеты из сундука", "Coins from the chest"), () => {
    const n = rnd(10, 90);
    const k = rnd(2, 5);
    return {
      code: L(`text = ${str(n)}`, "coins = int(text)", `print(coins * ${k})`),
      explanation: T(`int(text) превращает строку "${n}" в число, и его можно умножить: ${n * k}.`,
        `int(text) turns the string "${n}" into a number, and it can be multiplied: ${n * k}.`)
    };
  });

  copy("types", 3, "label", T("Подпись к здоровью", "A health label"), () => ({
    code: L(`hp = ${rnd(10, 99)}`, T('line = "Здоровье: " + str(hp)', 'line = "Health: " + str(hp)'), "print(line)"),
    explanation: T("str(hp) делает из числа строку, и её можно склеить с текстом через +.",
      "str(hp) turns the number into a string, and it can be joined with text using +.")
  }));

  // ================= Операторы и выражения =================

  fill("operators", 1, "arith", T("Подбери знак", "Pick the sign"), () => {
    let a;
    let b;
    let res;
    do {
      b = rnd(2, 5);
      a = b * rnd(2, 6);
      res = { "+": a + b, "-": a - b, "*": a * b, "/": a / b };
    } while (!distinct([res["+"], res["-"], res["*"], res["/"]]));
    const names = pick([["damage", "bonus"], ["gold", "price"], ["hp", "heal"]]);
    const op = pick(["+", "-", "*", "/"]);
    const shown = op === "/" ? pyFloat(res[op]) : String(res[op]);
    return {
      code: L(`${names[0]} = ${a}`, `${names[1]} = ${b}`, `print(${names[0]} ___ ${names[1]})` + says(shown)),
      options: [op].concat(["+", "-", "*", "/"].filter((o) => o !== op)),
      expect: shown,
      explanation: `${a} ${op} ${b} = ${shown}.` +
        (op === "/" ? T(" Деление / всегда даёт дробное число, даже без остатка.",
          " Division / always gives a float, even when nothing is left over.") : "")
    };
  });

  fill("operators", 2, "divmod", T("Делим добычу", "Sharing the loot"), () => {
    let a;
    let b;
    do {
      a = rnd(11, 47);
      b = rnd(3, 7);
    } while (a % b === 0 || !distinct([Math.floor(a / b), a % b, a - b]));
    const op = pick(["//", "%"]);
    const whole = Math.floor(a / b);
    const val = op === "//" ? whole : a % b;
    return {
      code: L(`coins = ${a}`, `heroes = ${b}`, "print(coins ___ heroes)" + says(val)),
      options: [op, op === "//" ? "%" : "//", "/", "-"],
      expect: String(val),
      explanation: op === "//"
        ? T(`// — целая часть деления: ${a} // ${b} = ${whole}, каждому герою по ${whole}. Остаток ${a % b} дал бы знак %.`,
          `// gives the whole part of the division: ${a} // ${b} = ${whole}, so every hero gets ${whole}. The remainder ${a % b} would come from %.`)
        : T(`% — остаток от деления: ${a} = ${b} · ${whole} + ${val}, поэтому ${a} % ${b} = ${val}. Знак // дал бы ${whole}.`,
          `% gives the remainder: ${a} = ${b} · ${whole} + ${val}, so ${a} % ${b} = ${val}. The sign // would give ${whole}.`)
    };
  });

  fill("operators", 2, "augmented", T("Короткая запись", "The short form"), () => {
    const v = pick(["hp", "gold", "mana"]);
    const n = rnd(30, 90);
    const k = rnd(5, 25);
    const minus = Math.random() < 0.5;
    const val = minus ? n - k : n + k;
    const sign = minus ? "-" : "+";
    return {
      code: L(`${v} = ${n}`, `${v} ___ ${k}`, `print(${v})` + says(val)),
      options: minus ? ["-=", "+=", "=-", "=="] : ["+=", "-=", "=+", "=="],
      expect: String(val),
      explanation: T(`${v} ${sign}= ${k} — короткая запись ${v} = ${v} ${sign} ${k}. ` +
        `Осторожно: ${v} =${sign} ${k} просто запишет в ${v} число ${minus ? "-" : ""}${k}.`,
        `${v} ${sign}= ${k} is short for ${v} = ${v} ${sign} ${k}. ` +
        `Careful: ${v} =${sign} ${k} would simply store the number ${minus ? "-" : ""}${k} in ${v}.`)
    };
  });

  fill("operators", 2, "compare", T("Правда или ложь", "True or false"), () => {
    const v = pick(["hp", "gold", "level"]);
    const x = rnd(0, 30);
    const lim = Math.random() < 0.3 ? x : rnd(0, 30);
    const test = {
      "==": x === lim, "!=": x !== lim, ">": x > lim, "<": x < lim, ">=": x >= lim, "<=": x <= lim
    };
    const want = Math.random() < 0.5;
    const ops = Object.keys(test);
    const op = pick(ops.filter((o) => test[o] === want));
    const word = want ? "True" : "False";
    return {
      code: L(`${v} = ${x}`, `print(${v} ___ ${lim})` + says(word)),
      // Из шести сравнений ровно три дают True и три False.
      options: [op].concat(ops.filter((o) => test[o] !== want)),
      expect: word,
      explanation: T(`${v} = ${x}, и сравнение ${x} ${op} ${lim} ${want ? "верно" : "неверно"} — это ${word}.`,
        `${v} = ${x}, and the comparison ${x} ${op} ${lim} is ${want ? "true" : "false"} — so the result is ${word}.`)
    };
  });

  fill("operators", 3, "logic", T("И или ИЛИ", "And or or"), () => {
    const pair = pick([["has_key", "has_torch"], ["is_brave", "is_tired"], ["has_map", "has_boat"]]);
    const firstTrue = Math.random() < 0.5;
    const want = Math.random() < 0.5;
    return {
      code: L(
        `${pair[0]} = ${firstTrue ? "True" : "False"}`,
        `${pair[1]} = ${firstTrue ? "False" : "True"}`,
        `print(${pair[0]} ___ ${pair[1]})` + says(want ? "True" : "False")
      ),
      options: want ? ["or", "and", "==", "is"] : ["and", "or", "!=", "is not"],
      expect: want ? "True" : "False",
      explanation: want
        ? T("or даёт True, если правда хотя бы одна часть. Здесь одна из двух — True.",
          "or gives True if at least one part is true. Here one of the two is True.")
        : T("and даёт True, только если правдивы обе части. Здесь одна ложна — получится False.",
          "and gives True only if both parts are true. Here one is false, so the result is False.")
    };
  });

  fill("operators", 3, "not", T("Наоборот", "The opposite"), () => {
    const pair = pick(T([["alive", "Герой пал"], ["has_key", "Нужен ключ"], ["is_day", "Наступила ночь"]],
      [["alive", "The hero has fallen"], ["has_key", "A key is needed"], ["is_day", "Night has come"]]));
    return {
      code: L(`${pair[0]} = False`, `if ___ ${pair[0]}:`, `    print(${str(pair[1])})` + says(pair[1])),
      options: ["not", "!", "no", "non"],
      expect: pair[1],
      explanation: T("not переворачивает значение: not False — это True, поэтому print выполняется. Знака ! в Python для этого нет.",
        "not flips the value: not False is True, so print runs. There is no ! operator for this in Python.")
    };
  });

  fill("operators", 3, "minutes", T("Минуты и секунды", "Minutes and seconds"), () => {
    let s;
    do {
      s = rnd(65, 400);
    } while (s % 60 === 0 || s % 60 === Math.floor(s / 60));
    const m = Math.floor(s / 60);
    return {
      code: L(`seconds = ${s}`, "minutes = seconds ___ 60", "print(minutes)" + says(m)),
      options: ["//", "/", "%", "-"],
      expect: String(m),
      explanation: T(`// отбрасывает остаток: ${s} // 60 = ${m} — столько полных минут. ` +
        `/ дало бы дробное число, а % — остаток в секундах: ${s % 60}.`,
        `// drops the remainder: ${s} // 60 = ${m} — that many full minutes. ` +
        `/ would give a float, and % would give the seconds left over: ${s % 60}.`)
    };
  });

  fill("operators", 4, "precedence", T("Порядок действий", "Order of operations"), () => {
    let a;
    let b;
    let c;
    let vals;
    do {
      a = rnd(1, 6);
      b = rnd(2, 4);
      c = rnd(2, 3);
      vals = [a + Math.pow(b, c), a + b * c, a + b + c, a + b - c];
    } while (!distinct(vals));
    return {
      code: `print(${a} + ${b} ___ ${c})` + says(vals[0]),
      options: ["**", "*", "+", "-"],
      expect: String(vals[0]),
      explanation: T(`Сначала выполняется степень: ${b} ** ${c} = ${Math.pow(b, c)}, потом сложение: ` +
        `${a} + ${Math.pow(b, c)} = ${vals[0]}.`,
        `The power is evaluated first: ${b} ** ${c} = ${Math.pow(b, c)}, then the addition: ` +
        `${a} + ${Math.pow(b, c)} = ${vals[0]}.`)
    };
  });

  bug("operators", 2, "assign_in_if", T("Проверка не работает", "The check does not work"), () => {
    const v = pick(T([["hp", "Поражение"], ["gold", "Кошелёк пуст"], ["keys", "Дверь не открыть"]],
      [["hp", "Defeat"], ["gold", "The purse is empty"], ["keys", "The door won't open"]]));
    return {
      code: L(`${v[0]} = 0`, `if ${v[0]} = 0:`, `    print(${str(v[1])})`),
      options: T([
        "В условии нужно сравнение ==, а не присваивание =",
        "После if не ставят двоеточие",
        "С нулём сравнивать нельзя",
        "print должен стоять без отступа"
      ], [
        "The condition needs ==, not the assignment =",
        "There is no colon after if",
        "Nothing can be compared with zero",
        "print must not be indented"
      ]),
      raises: "SyntaxError",
      fix: L(`${v[0]} = 0`, `if ${v[0]} == 0:`, `    print(${str(v[1])})`),
      explanation: T("Один знак = записывает значение, а сравнивают двумя: ==. В условии if нужно сравнение.",
        "A single = stores a value; comparing takes two: ==. An if condition needs a comparison.")
    };
  });

  bug("operators", 2, "lost_result", T("Урон не проходит", "The damage does not land"), () => {
    const hp = rnd(60, 120);
    const d = rnd(10, 40);
    return {
      code: L(`hp = ${hp}`, `damage = ${d}`, "hp - damage", "print(hp)" + wants(hp - d)),
      options: T([
        "Результат hp - damage никуда не записан: нужно hp = hp - damage",
        "Переменные нельзя вычитать друг из друга",
        "print нужно поставить выше",
        "damage должен быть больше hp"
      ], [
        "The result of hp - damage is not stored anywhere: it must be hp = hp - damage",
        "Variables cannot be subtracted from each other",
        "print must be placed higher",
        "damage must be greater than hp"
      ]),
      expect: String(hp - d),
      fix: L(`hp = ${hp}`, `damage = ${d}`, "hp = hp - damage", "print(hp)"),
      explanation: T(`Строка hp - damage считает ${hp - d}, но никуда не сохраняет — hp остаётся ${hp}. ` +
        "Результат нужно записать: hp = hp - damage.",
        `The line hp - damage computes ${hp - d} but stores it nowhere — hp stays ${hp}. ` +
        "The result must be assigned: hp = hp - damage.")
    };
  });

  bug("operators", 2, "slash_half", T("Делим поровну", "Sharing equally"), () => {
    let a;
    do {
      a = rnd(7, 41);
    } while (a % 2 === 0);
    const want = Math.floor(a / 2);
    return {
      code: L(`arrows = ${a}`, "each = arrows / 2", "print(each)" + wants(want)),
      options: T([
        `/ даёт дробное ${a / 2}, а целую часть даёт //`,
        "На 2 делить нельзя",
        "Нужно умножать, а не делить",
        "print не печатает дроби"
      ], [
        `/ gives the float ${a / 2}, while // gives the whole part`,
        "Two cannot be divided by",
        "You must multiply, not divide",
        "print does not print fractions"
      ]),
      expect: String(want),
      fix: L(`arrows = ${a}`, "each = arrows // 2", "print(each)"),
      explanation: T(`${a} / 2 = ${a / 2} — дробное число. Целое число стрел на каждого даёт деление с отбрасыванием остатка: ` +
        `${a} // 2 = ${want}.`,
        `${a} / 2 = ${a / 2} — a float. The whole number of arrows each gets comes from division that drops the remainder: ` +
        `${a} // 2 = ${want}.`)
    };
  });

  bug("operators", 3, "eq_minus", T("Кошелёк странно худеет", "The purse shrinks strangely"), () => {
    const n = rnd(40, 90);
    const k = rnd(5, 30);
    return {
      code: L(`gold = ${n}`, `gold =- ${k}`, "print(gold)" + wants(n - k)),
      options: T([
        `Знаки перепутаны: =- ${k} записывает -${k}, нужно -=`,
        "Из переменной нельзя вычитать",
        "print не видит переменную gold",
        `Число ${k} нужно взять в кавычки`
      ], [
        `The signs are swapped: =- ${k} stores -${k}, it must be -=`,
        "A variable cannot be subtracted from",
        "print cannot see the variable gold",
        `The number ${k} must be in quotes`
      ]),
      expect: String(n - k),
      fix: L(`gold = ${n}`, `gold -= ${k}`, "print(gold)"),
      explanation: T(`gold =- ${k} читается как gold = -${k}: старое значение пропадает. Уменьшить на ${k} — это gold -= ${k}.`,
        `gold =- ${k} is read as gold = -${k}: the old value is lost. To reduce it by ${k}, write gold -= ${k}.`)
    };
  });

  copy("operators", 1, "crit", T("Критический удар", "Critical hit"), () => {
    const d = rnd(5, 30);
    const k = pick([2, 3]);
    return {
      code: L(`damage = ${d}`, `crit = damage * ${k}`, "print(crit)"),
      explanation: T(`crit = damage * ${k} — урон, умноженный на ${k}: ${d * k}.`,
        `crit = damage * ${k} is the damage multiplied by ${k}: ${d * k}.`)
    };
  });

  copy("operators", 2, "spend", T("Покупка в лавке", "Shopping at the stall"), () => {
    const n = rnd(60, 150);
    const p = rnd(10, 50);
    return {
      code: L(`gold = ${n}`, `gold -= ${p}`, "print(gold)"),
      explanation: T(`gold -= ${p} — то же, что gold = gold - ${p}. Останется ${n - p}.`,
        `gold -= ${p} is the same as gold = gold - ${p}. ${n - p} remains.`)
    };
  });

  copy("operators", 2, "quivers", T("Колчаны", "Quivers"), () => {
    const a = rnd(11, 40);
    const b = pick([3, 4, 5]);
    return {
      code: L(`arrows = ${a}`, `print(arrows // ${b}, arrows % ${b})`),
      explanation: T(`// — сколько полных колчанов, если в каждом ${b}: ${Math.floor(a / b)}, а % — сколько стрел останется: ${a % b}.`,
        `// gives the number of full quivers of ${b}: ${Math.floor(a / b)}, and % gives the arrows left over: ${a % b}.`)
    };
  });

  copy("operators", 4, "ternary", T("Состояние героя", "The hero's condition"), () => {
    const hp = rnd(10, 90);
    const lim = pick([30, 50]);
    return {
      code: L(`hp = ${hp}`, T(`state = "ранен" if hp < ${lim} else "бодр"`,
        `state = "hurt" if hp < ${lim} else "ok"`), "print(state)"),
      explanation: T(`Выражение «A if условие else B» выбирает одно из двух значений: здесь «${hp < lim ? "ранен" : "бодр"}».`,
        `The expression “A if condition else B” picks one of two values: here “${hp < lim ? "hurt" : "ok"}”.`)
    };
  });

  // ================= Строки =================

  fill("strings", 1, "first_letter", T("Первая буква", "The first letter"), () => {
    const word = pick(T(["кот", "дом", "лес"], ["cat", "dog", "fox"]));
    return {
      code: L(`word = ${str(word)}`, "print(word[___])" + says(word[0])),
      options: ["0", "1", "2", "-1"],
      expect: word[0],
      explanation: T("Индексы начинаются с нуля: word[0] — первый символ, word[1] — второй.",
        "Indexes start at zero: word[0] is the first character, word[1] is the second.")
    };
  });

  fill("strings", 2, "case", T("Регистр букв", "Letter case"), () => {
    const m = pick(MONSTERS);
    const mode = pick(["upper", "lower", "title"]);
    const src = mode === "lower" ? m.toUpperCase() : m;
    const want = mode === "upper" ? m.toUpperCase() : mode === "lower" ? m : cap(m);
    const why = T({
      upper: "upper() делает все буквы заглавными.",
      lower: "lower() делает все буквы строчными.",
      title: "title() делает заглавной первую букву каждого слова."
    }, {
      upper: "upper() makes every letter uppercase.",
      lower: "lower() makes every letter lowercase.",
      title: "title() capitalises the first letter of every word."
    });
    return {
      code: `print(${str(src)}.___)` + says(want),
      options: [mode + "()"].concat(["upper()", "lower()", "title()", "strip()"].filter((o) => o !== mode + "()")),
      expect: want,
      explanation: why[mode]
    };
  });

  fill("strings", 2, "len", T("Длина имени", "The length of a name"), () => {
    const m = pick(MONSTERS);
    return {
      code: L(`monster = ${str(m)}`, "print(___(monster))" + says(m.length)),
      options: ["len", "int", "str", "type"],
      expect: String(m.length),
      explanation: T(`len() считает символы строки: в слове «${m}» их ${m.length}.`,
        `len() counts the characters of a string: the word “${m}” has ${m.length}.`)
    };
  });

  fill("strings", 2, "index", T("Буква по номеру", "A letter by number"), () => {
    const words = MONSTERS.filter((w) => w.length >= 4 && distinct([w[0], w[1], w[2], w[w.length - 1]]));
    const w = pick(words);
    const at = { "0": w[0], "1": w[1], "2": w[2], "-1": w[w.length - 1] };
    const right = pick(Object.keys(at));
    return {
      code: L(`word = ${str(w)}`, "print(word[___])" + says(at[right])),
      options: [right].concat(Object.keys(at).filter((i) => i !== right)),
      expect: at[right],
      explanation: T(`Номера символов считаются с нуля: word[0] — «${w[0]}», word[1] — «${w[1]}», ` +
        `а word[-1] — последняя буква «${w[w.length - 1]}».`,
        `Character numbers start at zero: word[0] is “${w[0]}”, word[1] is “${w[1]}”, ` +
        `and word[-1] is the last letter, “${w[w.length - 1]}”.`)
    };
  });

  fill("strings", 2, "concat", T("Приветствие", "A greeting"), () => {
    const hero = pick(HEROES);
    const greet = pick(T(["Привет, ", "Слава, ", "Удачи, "], ["Hello, ", "Glory, ", "Good luck, "]));
    return {
      code: L(`name = ${str(hero)}`, `print(${str(greet)} ___ name)` + says(greet + hero)),
      options: ["+", "-", "*", "/"],
      expect: greet + hero,
      explanation: T("Строки склеивают знаком +. Вычитать, умножать друг на друга и делить строки нельзя.",
        "Strings are joined with +. Strings cannot be subtracted, multiplied together or divided.")
    };
  });

  fill("strings", 2, "repeat", T("Боевой клич", "A battle cry"), () => {
    const w = pick(T(["ха", "ур", "бум", "ой"], ["ha", "hur", "boom", "oy"]));
    const n = rnd(2, 4);
    return {
      code: `print(${str(w)} ___ ${n})` + says(w.repeat(n)),
      options: ["*", "+", "**", "/"],
      expect: w.repeat(n),
      explanation: T(`Строка, умноженная на число, повторяется: ${str(w)} * ${n} — это «${w.repeat(n)}».`,
        `A string multiplied by a number repeats: ${str(w)} * ${n} is “${w.repeat(n)}”.`)
    };
  });

  fill("strings", 3, "fstring", T("Подстановка в строку", "Substitution in a string"), () => {
    const v = pick(T([["hp", "Здоровье"], ["gold", "Золото"], ["xp", "Опыт"]],
      [["hp", "Health"], ["gold", "Gold"], ["xp", "XP"]]));
    const n = rnd(5, 99);
    return {
      code: L(`${v[0]} = ${n}`, `print(___"${v[1]}: {${v[0]}}")` + says(v[1] + ": " + n)),
      options: ["f", "s", "r", "u"],
      expect: v[1] + ": " + n,
      explanation: T(`Буква f перед кавычками включает подстановку: {${v[0]}} заменяется значением ${n}. ` +
        "Без неё напечатались бы сами фигурные скобки.",
        `The letter f before the quotes turns on substitution: {${v[0]}} is replaced by ${n}. ` +
        "Without it the braces themselves would be printed.")
    };
  });

  fill("strings", 3, "split", T("Разбери строку", "Split the string"), () => {
    const items = sample(SHORT_ITEMS, 3);
    return {
      code: L(`line = ${str(items.join(","))}`, 'items = line.___(",")', "print(items)" + says(shownList(items))),
      options: ["split", "strip", "find", "count"],
      expect: shownList(items),
      explanation: T(`split(",") режет строку по запятым и возвращает список: ${shownList(items)}.`,
        `split(",") cuts the string at the commas and returns a list: ${shownList(items)}.`)
    };
  });

  fill("strings", 3, "join", T("Собери строку", "Join a string"), () => {
    const items = sample(ITEMS, 3);
    const sep = pick(T([", ", " и ", " + "], [", ", " and ", " + "]));
    return {
      code: L(`items = ${strList(items)}`, `print(${str(sep)}.___(items))` + says(items.join(sep))),
      options: ["join", "split", "append", "add"],
      expect: items.join(sep),
      explanation: T(`join склеивает элементы списка в одну строку и ставит между ними ${str(sep)}.`,
        `join glues the list items into one string and puts ${str(sep)} between them.`)
    };
  });

  fill("strings", 3, "in", T("Есть ли слово", "Is the word there"), () => {
    const m = pick(MONSTERS);
    const text = pick(T(["в пещере спит", "за дверью ждёт", "в болоте живёт"],
      ["sleeps in cave", "waits by door", "lives in swamp"])) + " " + m;
    return {
      code: L(`text = ${str(text)}`, `print(${str(m)} ___ text)` + says("True")),
      options: ["in", "not in", "==", "+"],
      expect: "True",
      explanation: T(`Оператор in проверяет, есть ли кусок внутри строки: «${m}» в тексте есть, поэтому True.`,
        `The in operator checks whether a piece is inside the string: “${m}” is in the text, so the result is True.`)
    };
  });

  fill("strings", 3, "replace", T("Замена слова", "Replacing a word"), () => {
    const pair = sample(MONSTERS, 2);
    const verb = pick(T(["атакует", "убегает", "спит"], ["attacks", "runs away", "sleeps"]));
    return {
      code: L(`msg = ${str(pair[0] + " " + verb)}`, `print(msg.replace(${str(pair[0])}, ___))` + says(pair[1] + " " + verb)),
      options: [str(pair[1]), pair[1], str(pair[0]), str("")],
      expect: pair[1] + " " + verb,
      explanation: T(`replace(старое, новое) заменяет кусок строки. Новое слово — тоже строка, поэтому в кавычках: ${str(pair[1])}.`,
        `replace(old, new) swaps a piece of the string. The new word is a string too, so it needs quotes: ${str(pair[1])}.`)
    };
  });

  fill("strings", 4, "slice", T("Срез строки", "A string slice"), () => {
    const words = T(["подземелье", "сокровище", "заклинание", "лабиринт", "катакомбы"],
      ["dungeon", "treasure", "spellbook", "labyrinth", "catacombs"]);
    let w;
    let k;
    let head;
    let opts;
    let vals;
    do {
      w = pick(words);
      k = pick(T([3, 4], [3, 4, 5]));
      head = Math.random() < 0.5;
      const cut = (a, b) => w.slice(a, b);
      opts = head
        ? [`0:${k}`, `1:${k}`, `0:${k - 1}`, `${k}`]
        : [`-${k}:`, `${k}:`, `-${k - 1}:`, `:${k}`];
      vals = head
        ? [cut(0, k), cut(1, k), cut(0, k - 1), w[k]]
        : [cut(-k), cut(k), cut(-(k - 1)), cut(0, k)];
    } while (!distinct(vals));
    return {
      code: L(`word = ${str(w)}`, "print(word[___])" + says(vals[0])),
      options: opts,
      expect: vals[0],
      explanation: head
        ? T(`Срез [0:${k}] берёт символы с номерами от 0 до ${k - 1}: правая граница в срез не входит. Получается «${vals[0]}».`,
          `The slice [0:${k}] takes the characters numbered 0 to ${k - 1}: the right edge is not included. That gives “${vals[0]}”.`)
        : T(`Срез [-${k}:] берёт последние ${k} символа строки: «${vals[0]}».`,
          `The slice [-${k}:] takes the last ${k} characters of the string: “${vals[0]}”.`)
    };
  });

  bug("strings", 2, "no_call", T("Монстр не кричит", "The monster does not shout"), () => {
    const m = pick(MONSTERS);
    return {
      code: L(`monster = ${str(m)}`, "print(monster.upper)" + wants(m.toUpperCase())),
      options: T([
        "upper вызван без скобок: нужно monster.upper()",
        "У строк нет метода upper",
        "UPPER нужно писать большими буквами",
        "Слово нужно взять в одинарные кавычки"
      ], [
        "upper is called without brackets: it must be monster.upper()",
        "Strings have no upper method",
        "UPPER must be written in capitals",
        "The word must use single quotes"
      ]),
      expect: m.toUpperCase(),
      fix: L(`monster = ${str(m)}`, "print(monster.upper())"),
      explanation: T("Метод — это функция, её вызывают со скобками: monster.upper(). Без скобок print покажет сам метод, а не результат.",
        "A method is a function, so it is called with brackets: monster.upper(). Without them print shows the method itself, not the result.")
    };
  });

  bug("strings", 2, "mixed_quotes", T("Кривая надпись", "The crooked sign"), () => {
    const msg = pick(T(["Привет, маг", "Стой, орк", "Эй, путник"],
      ["Hello, mage", "Halt, orc", "Hey, traveller"]));
    return {
      code: `print("${msg}')`,
      options: T([
        `Кавычки разные: строка открыта ", а закрыта '`,
        "В конце строки нужна точка",
        "Запятая внутри строки запрещена",
        "Скобку закрыли лишний раз"
      ], [
        `The quotes differ: the string opens with " and closes with '`,
        "The string needs a dot at the end",
        "A comma inside a string is forbidden",
        "The bracket is closed one time too many"
      ]),
      raises: "SyntaxError",
      fix: `print("${msg}")`,
      explanation: T("Строку открывают и закрывают одинаковыми кавычками: \"...\" или '...'. Смешивать их нельзя.",
        "A string opens and closes with the same kind of quote: \"...\" or '...'. They cannot be mixed.")
    };
  });

  bug("strings", 3, "immutable", T("Имя с большой буквы", "A name with a capital letter"), () => {
    const m = pick(MONSTERS);
    const big = m[0].toUpperCase();
    return {
      code: L(`name = ${str(m)}`, `name[0] = ${str(big)}`, "print(name)"),
      options: T([
        "Строку нельзя менять по индексу: она неизменяемая",
        "У строки нет символа с номером 0",
        "Большую букву нельзя хранить в строке",
        "Нужны одинарные кавычки"
      ], [
        "A string cannot be changed by index: it is immutable",
        "The string has no character number 0",
        "A capital letter cannot be stored in a string",
        "Single quotes are required"
      ]),
      raises: "TypeError",
      fix: L(`name = ${str(m)}`, `name = ${str(big)} + name[1:]`, "print(name)"),
      explanation: T(`Строки в Python неизменяемые: букву внутри заменить нельзя. Собирают новую строку: name = "${big}" + name[1:].`,
        `Strings in Python are immutable: a letter inside cannot be replaced. A new string is built: name = "${big}" + name[1:].`)
    };
  });

  bug("strings", 3, "no_f", T("Счётчик без чисел", "A counter without numbers"), () => {
    const v = pick(T([["hp", "HP"], ["gold", "Золото"], ["xp", "Опыт"]],
      [["hp", "HP"], ["gold", "Gold"], ["xp", "XP"]]));
    const n = rnd(10, 99);
    return {
      code: L(`${v[0]} = ${n}`, `print("${v[1]}: {${v[0]}}")` + wants(v[1] + ": " + n)),
      options: T([
        "Забыта буква f перед строкой",
        "Фигурные скобки можно писать только в функциях",
        "print не умеет печатать фигурные скобки",
        "Двоеточие внутри строки запрещено"
      ], [
        "The letter f before the string is missing",
        "Braces may only be used inside functions",
        "print cannot print braces",
        "A colon inside a string is forbidden"
      ]),
      expect: v[1] + ": " + n,
      fix: L(`${v[0]} = ${n}`, `print(f"${v[1]}: {${v[0]}}")`),
      explanation: T(`Подстановку {${v[0]}} делает только f-строка — с буквой f перед кавычками. Без неё скобки печатаются как есть.`,
        `Only an f-string substitutes {${v[0]}} — it needs the letter f before the quotes. Without it the braces are printed as they are.`)
    };
  });

  bug("strings", 3, "index_out", T("Лишняя буква", "One letter too many"), () => {
    const m = pick(MONSTERS.filter((w) => w.length <= 6));
    const n = m.length;
    return {
      code: L(`word = ${str(m)}`, `print(word[${n}])`),
      options: T([
        `Длина слова — ${n}, номера букв от 0 до ${n - 1}: индекса ${n} нет`,
        "Номера букв в строке начинаются с 1",
        "Строку нельзя брать по индексу",
        `Нужно писать word(${n})`
      ], [
        `The word is ${n} letters long, so the numbers run from 0 to ${n - 1}: there is no index ${n}`,
        "Letter numbers in a string start at 1",
        "A string cannot be indexed",
        `You must write word(${n})`
      ]),
      raises: "IndexError",
      fix: L(`word = ${str(m)}`, `print(word[${n - 1}])`),
      explanation: T(`Номера символов идут с нуля, поэтому последний — ${n - 1} (или -1). Индекс ${n} уже за концом строки.`,
        `Character numbers start at zero, so the last one is ${n - 1} (or -1). The index ${n} is already past the end of the string.`)
    };
  });

  copy("strings", 2, "upper", T("Клич монстра", "The monster's cry"), () => ({
    code: L(`monster = ${str(pick(MONSTERS))}`, "print(monster.upper())"),
    explanation: T("Метод upper() возвращает строку заглавными буквами.",
      "The upper() method returns the string in capital letters.")
  }));

  copy("strings", 2, "greet", T("Приветствие", "A greeting"), () => ({
    code: L(`name = ${str(pick(HEROES))}`, T('print("Привет, " + name + "!")', 'print("Hello, " + name + "!")')),
    explanation: T("Знак + склеивает строки: текст, имя и восклицательный знак.",
      "The + sign joins strings: the text, the name and the exclamation mark.")
  }));

  copy("strings", 3, "fstring", T("Карточка героя", "The hero's card"), () => ({
    code: L(`hero = ${str(pick(HEROES))}`, `hp = ${rnd(40, 100)}`, 'print(f"{hero}: {hp} HP")'),
    explanation: T("f-строка подставляет значения переменных из фигурных скобок.",
      "An f-string substitutes the variable values from the braces.")
  }));

  copy("strings", 3, "split", T("Список из строки", "A list from a string"), () => ({
    code: L(`line = ${str(sample(ITEMS, 3).join(","))}`, 'items = line.split(",")', "print(items)"),
    explanation: T("split(\",\") режет строку по запятым и возвращает список.",
      "split(\",\") cuts the string at the commas and returns a list.")
  }));

  // ================= Условия и циклы =================

  fill("control", 1, "if_word", T("Если здоровье", "If health"), () => {
    const hp = rnd(1, 50);
    const msg = pick(T(["жив", "цел", "держится"], ["alive", "whole", "holding on"]));
    return {
      code: L(`hp = ${hp}`, "___ hp > 0:", `    print(${str(msg)})` + says(msg)),
      options: ["if", "elif", "else", "def"],
      expect: msg,
      explanation: T("Проверка условия начинается словом if: if hp > 0:. Тело условия пишут с отступом.",
        "A condition starts with the word if: if hp > 0:. The body of the condition is indented.")
    };
  });

  fill("control", 2, "else", T("Иначе", "Otherwise"), () => {
    const c = pick(T([
      { v: "hp", val: 0, cond: "hp > 0", yes: "Жив", no: "Пал" },
      { v: "gold", val: rnd(1, 9), cond: "gold >= 10", yes: "Покупаю меч", no: "Не хватает золота" },
      { v: "keys", val: 0, cond: "keys > 0", yes: "Открываю дверь", no: "Дверь заперта" }
    ], [
      { v: "hp", val: 0, cond: "hp > 0", yes: "Alive", no: "Fallen" },
      { v: "gold", val: rnd(1, 9), cond: "gold >= 10", yes: "I buy a sword", no: "Not enough gold" },
      { v: "keys", val: 0, cond: "keys > 0", yes: "I open the door", no: "The door is locked" }
    ]));
    return {
      code: L(`${c.v} = ${c.val}`, `if ${c.cond}:`, `    print(${str(c.yes)})`, "___:", `    print(${str(c.no)})` + says(c.no)),
      options: ["else", "elif", "if", "then"],
      expect: c.no,
      explanation: T(`Условие ${c.cond} ложно, поэтому выполняется ветка else. elif и if требуют своего условия, а слова then в Python нет.`,
        `The condition ${c.cond} is false, so the else branch runs. elif and if need a condition of their own, and Python has no then.`)
    };
  });

  fill("control", 2, "range_count", T("Сколько шагов", "How many steps"), () => {
    const n = rnd(3, 7);
    return {
      code: L("steps = 0", "for i in range(___):", "    steps += 1", "print(steps)" + says(n)),
      options: [String(n), String(n - 1), String(n + 1), "0"],
      expect: String(n),
      explanation: T(`range(${n}) даёт ${n} ${plural(n, "число", "числа", "чисел")} — от 0 до ${n - 1}. ` +
        `Значит, цикл сделает ${n} ${plural(n, "шаг", "шага", "шагов")}.`,
        `range(${n}) gives ${n} ${pluralEn(n, "number", "numbers")} — from 0 to ${n - 1}. ` +
        `So the loop makes ${n} ${pluralEn(n, "step", "steps")}.`)
    };
  });

  fill("control", 2, "for_in", T("Перебор сумки", "Looping over the bag"), () => {
    const items = sample(ITEMS, rnd(2, 3));
    return {
      code: L(`bag = ${strList(items)}`, "for item ___ bag:", "    print(item)"),
      options: ["in", "of", "from", "="],
      expect: items.join("\n"),
      explanation: T("Цикл for перебирает элементы так: for элемент in список. Слово in обязательно.",
        "A for loop walks the items like this: for item in list. The word in is required.")
    };
  });

  fill("control", 3, "range_from", T("Числа не с нуля", "Numbers not from zero"), () => {
    const s = rnd(1, 3);
    const t = s + rnd(2, 3);
    const nums = [];
    for (let i = s; i <= t; i++) nums.push(i);
    return {
      code: L("nums = []", "for i in range(___):", "    nums.append(i)", "print(nums)" + says(numList(nums))),
      options: [`${s}, ${t + 1}`, `${s}, ${t}`, `${t + 1}`, `${s + 1}, ${t + 1}`],
      expect: numList(nums),
      explanation: T(`range(${s}, ${t + 1}) начинает с ${s} и останавливается перед ${t + 1}: второе число в range не входит.`,
        `range(${s}, ${t + 1}) starts at ${s} and stops before ${t + 1}: the second number is not included.`)
    };
  });

  fill("control", 3, "while", T("Пока горят факелы", "While the torches burn"), () => {
    const n = rnd(2, 6);
    const v = pick(["torches", "potions", "arrows"]);
    return {
      code: L(`${v} = ${n}`, `while ${v} ___ 0:`, `    ${v} -= 1`, `print(${v})` + says(0)),
      options: [">", "<", ">=", "=="],
      expect: "0",
      explanation: T(`Цикл идёт, пока ${v} > 0, и на каждом шаге отнимает 1. Когда станет 0, условие ложно и цикл кончается.`,
        `The loop runs while ${v} > 0 and takes 1 away each step. At 0 the condition is false and the loop ends.`)
    };
  });

  fill("control", 3, "break", T("Нашёл — стоп", "Found it — stop"), () => {
    const k = rnd(2, 6);
    const n = rnd(k + 3, 10);
    return {
      code: L(`for room in range(${n}):`, `    if room == ${k}:`, "        ___", "print(room)" + says(k)),
      options: ["break", "continue", "pass", "return"],
      expect: String(k),
      explanation: T(`break сразу прерывает цикл: на комнате ${k} перебор останавливается. С continue и pass цикл дошёл бы до ${n - 1}.`,
        `break stops the loop at once: at room ${k} the walk ends. With continue or pass the loop would reach ${n - 1}.`)
    };
  });

  fill("control", 3, "continue", T("Обойди ловушку", "Skip the trap"), () => {
    const n = rnd(4, 6);
    const k = rnd(2, n - 1);
    const total = (n * (n + 1)) / 2 - k;
    return {
      code: L("total = 0", `for x in range(1, ${n + 1}):`, `    if x == ${k}:`, "        ___", "    total += x", "print(total)" + says(total)),
      options: ["continue", "break", "pass", "else"],
      expect: String(total),
      explanation: T(`continue пропускает остаток шага: число ${k} не прибавляется, а цикл идёт дальше. break остановил бы его совсем.`,
        `continue skips the rest of the step: ${k} is not added and the loop goes on. break would stop it entirely.`)
    };
  });

  fill("control", 3, "elif", T("Цепочка условий", "A chain of conditions"), () => {
    const hp = rnd(75, 100);
    const words = T({ note: "# выведет только: Бодр", a: "Бодр", b: "Ранен", c: "При смерти" },
      { note: "# prints only: Alert", a: "Alert", b: "Wounded", c: "Near death" });
    return {
      code: L(
        words.note,
        `hp = ${hp}`,
        "if hp > 70:",
        `    print("${words.a}")`,
        "___ hp > 30:",
        `    print("${words.b}")`,
        "else:",
        `    print("${words.c}")`
      ),
      options: ["elif", "if", "else", "else if"],
      expect: words.a,
      explanation: T("elif продолжает ту же цепочку и проверяется, только если первое условие ложно. " +
        "С отдельным if программа проверила бы hp > 30 заново и напечатала бы ещё и «Ранен».",
        "elif continues the same chain and is checked only if the first condition is false. " +
        "With a separate if the program would check hp > 30 again and print “Wounded” as well.")
    };
  });

  fill("control", 3, "accumulate", T("Копим золото", "Saving up gold"), () => {
    const nums = [rnd(2, 9), rnd(2, 9), rnd(2, 9)];
    const sum = nums[0] + nums[1] + nums[2];
    return {
      code: L("total = 0", `for coins in ${numList(nums)}:`, "    total ___ coins", "print(total)" + says(sum)),
      options: ["+=", "=", "-=", "*="],
      expect: String(sum),
      explanation: T("total += coins прибавляет каждую кучку к сумме. Простое = каждый раз затирало бы её, и осталась бы только последняя.",
        "total += coins adds every pile to the sum. A plain = would overwrite it each time, leaving only the last pile.")
    };
  });

  fill("control", 4, "nested", T("Комнаты и сундуки", "Rooms and chests"), () => {
    const a = rnd(2, 4);
    const b = rnd(2, 4);
    const wrong = [b + 1, b - 1, a * b, b + 2].filter((x, i, arr) => x !== b && arr.indexOf(x) === i).slice(0, 3);
    return {
      code: L("count = 0", `for room in range(${a}):`, "    for chest in range(___):", "        count += 1", "print(count)" + says(a * b)),
      options: [String(b)].concat(wrong.map(String)),
      expect: String(a * b),
      explanation: T(`Внутренний цикл проходит целиком на каждом шаге внешнего: ${a} · ${b} = ${a * b}.`,
        `The inner loop runs completely on every step of the outer one: ${a} · ${b} = ${a * b}.`)
    };
  });

  bug("control", 2, "if_colon", T("Лавка не работает", "The stall does not work"), () => {
    const v = pick(T([["gold", "Покупаю меч"], ["hp", "Иду дальше"], ["keys", "Открываю дверь"]],
      [["gold", "I buy a sword"], ["hp", "I go on"], ["keys", "I open the door"]]));
    const n = rnd(10, 50);
    return {
      code: L(`${v[0]} = ${n}`, `if ${v[0]} >= 10`, `    print(${str(v[1])})`),
      options: T([
        "Забыто двоеточие после условия if",
        "Знак >= в Python пишут как =>",
        "После if обязательно нужен else",
        "Текст в print пишут без кавычек"
      ], [
        "The colon after the if condition is missing",
        ">= is written as => in Python",
        "Every if must have an else",
        "The text in print is written without quotes"
      ]),
      raises: "SyntaxError",
      fix: L(`${v[0]} = ${n}`, `if ${v[0]} >= 10:`, `    print(${str(v[1])})`),
      explanation: T("Строка с if заканчивается двоеточием: оно открывает блок, который выполнится, если условие верно.",
        "The if line ends with a colon: it opens the block that runs when the condition is true.")
    };
  });

  bug("control", 2, "no_indent", T("Условие не срабатывает", "The condition does not fire"), () => {
    const v = pick(["hp", "gold", "keys"]);
    const n = rnd(1, 9);
    const word = T("Есть", "Yes");
    return {
      code: L(`${v} = ${n}`, `if ${v} > 0:`, `print(${str(word)})`),
      options: T([
        "Строку внутри if нужно сдвинуть отступом на 4 пробела",
        "После if не нужно двоеточие",
        "В условии нужно ==",
        "print нельзя писать внутри if"
      ], [
        "The line inside if must be indented by 4 spaces",
        "There is no colon after if",
        "The condition needs ==",
        "print cannot be written inside if"
      ]),
      raises: "IndentationError",
      fix: L(`${v} = ${n}`, `if ${v} > 0:`, `    print(${str(word)})`),
      explanation: T("Тело if — строки с отступом. Без отступа Python не понимает, что входит в блок, и падает с IndentationError.",
        "The body of an if is the indented lines. Without indentation Python cannot tell what belongs to the block and raises IndentationError.")
    };
  });

  bug("control", 2, "for_colon", T("Обход комнат", "Walking the rooms"), () => {
    const n = rnd(3, 6);
    return {
      code: L(`for i in range(${n})`, T('    print("Комната", i)', '    print("Room", i)')),
      options: T([
        "Забыто двоеточие в конце строки с for",
        "range пишется с большой буквы",
        "Вместо for нужен while",
        "Переменную i нужно создать заранее"
      ], [
        "The colon at the end of the for line is missing",
        "range is written with a capital letter",
        "while is needed instead of for",
        "The variable i must be created beforehand"
      ]),
      raises: "SyntaxError",
      fix: L(`for i in range(${n}):`, T('    print("Комната", i)', '    print("Room", i)')),
      explanation: T("Строка с for, как и с if, заканчивается двоеточием.",
        "A for line, like an if line, ends with a colon.")
    };
  });

  bug("control", 3, "range_end", T("Не хватает числа", "One number short"), () => {
    const s = rnd(1, 2);
    const t = rnd(4, 6);
    const want = [];
    for (let i = s; i <= t; i++) want.push(i);
    const note = T(`# нужно вывести числа от ${s} до ${t}`, `# print the numbers from ${s} to ${t}`);
    return {
      code: L(note, `for i in range(${s}, ${t}):`, "    print(i)"),
      options: T([
        `range(${s}, ${t}) не включает ${t}: нужно range(${s}, ${t + 1})`,
        "Счёт в range всегда начинается с 0",
        "print нужно писать без отступа",
        "В конце строки for не нужно двоеточие"
      ], [
        `range(${s}, ${t}) does not include ${t}: it must be range(${s}, ${t + 1})`,
        "Counting in range always starts at 0",
        "print must be written without indentation",
        "The for line needs no colon at the end"
      ]),
      expect: want.join("\n"),
      fix: L(note, `for i in range(${s}, ${t + 1}):`, "    print(i)"),
      explanation: T(`range останавливается перед вторым числом: range(${s}, ${t}) даёт числа только до ${t - 1}. ` +
        `Чтобы вывелось и ${t}, пишут range(${s}, ${t + 1}).`,
        `range stops before the second number: range(${s}, ${t}) only gives numbers up to ${t - 1}. ` +
        `To include ${t}, write range(${s}, ${t + 1}).`)
    };
  });

  bug("control", 3, "elif_after_else", T("Состояние героя", "The hero's condition"), () => {
    const hp = rnd(31, 69);
    const w = T({ a: "Бодр", b: "Ранен", c: "При смерти" },
      { a: "Alert", b: "Wounded", c: "Near death" });
    return {
      code: L(`hp = ${hp}`, "if hp > 70:", `    print("${w.a}")`, "else:", `    print("${w.c}")`, "elif hp > 30:", `    print("${w.b}")`),
      options: T([
        "elif не может стоять после else: else всегда последний",
        "В одной программе нельзя три раза вызывать print",
        "Сравнивать нужно знаком ==",
        "После else нужно написать условие"
      ], [
        "elif cannot follow else: else is always last",
        "print cannot be called three times in one program",
        "A comparison needs the ==" ,
        "else must be followed by a condition"
      ]),
      raises: "SyntaxError",
      fix: L(`hp = ${hp}`, "if hp > 70:", `    print("${w.a}")`, "elif hp > 30:", `    print("${w.b}")`, "else:", `    print("${w.c}")`),
      explanation: T("Цепочка всегда идёт так: if, потом сколько угодно elif, и в самом конце — else.",
        "The chain always goes if, then any number of elif, and else at the very end.")
    };
  });

  bug("control", 3, "never_runs", T("Тренировка не началась", "The training never started"), () => {
    const t = rnd(3, 7);
    return {
      code: L("n = 0", `while n > ${t}:`, "    n += 1", "print(n)" + wants(t)),
      options: T([
        `Условие n > ${t} сразу ложно, и цикл не выполнится ни разу: нужно n < ${t}`,
        "while нельзя использовать с числами",
        "n += 1 нужно написать до цикла",
        "print должен стоять внутри цикла"
      ], [
        `The condition n > ${t} is false at once, so the loop never runs: it must be n < ${t}`,
        "while cannot be used with numbers",
        "n += 1 must be written before the loop",
        "print must be inside the loop"
      ]),
      expect: String(t),
      fix: L("n = 0", `while n < ${t}:`, "    n += 1", "print(n)"),
      explanation: T(`Перед первым шагом n = 0, а 0 > ${t} — ложь, поэтому тело цикла не выполняется ни разу. ` +
        `Чтобы досчитать до ${t}, условие должно быть n < ${t}.`,
        `Before the first step n = 0, and 0 > ${t} is false, so the loop body never runs. ` +
        `To count up to ${t}, the condition must be n < ${t}.`)
    };
  });

  bug("control", 3, "break_outside", T("Побег из боя", "Fleeing the fight"), () => {
    const hp = rnd(5, 19);
    const cry = T("Бегу!", "Run!");
    return {
      code: L(`hp = ${hp}`, "if hp < 20:", `    print(${str(cry)})`, "    break"),
      options: T([
        "break работает только внутри цикла, а здесь цикла нет",
        "После if не ставят двоеточие",
        "print нельзя писать перед break",
        "Знак < нужно заменить на =<"
      ], [
        "break only works inside a loop, and there is no loop here",
        "There is no colon after if",
        "print cannot be written before break",
        "The sign < must be replaced by =<"
      ]),
      raises: "SyntaxError",
      fix: L(`hp = ${hp}`, "if hp < 20:", `    print(${str(cry)})`),
      explanation: T("break прерывает цикл for или while. В обычном if без цикла его писать нельзя.",
        "break ends a for or while loop. It cannot be used in a plain if with no loop.")
    };
  });

  bug("control", 3, "uneven_indent", T("Обход сундуков", "Walking the chests"), () => {
    const n = rnd(2, 4);
    return {
      code: L(`for i in range(${n}):`, T('    print("Сундук", i)', '    print("Chest", i)'),
        T('      print("Открыт")', '      print("Open")')),
      options: T([
        "Отступы в блоке разные: у всех строк внутри for он одинаковый",
        "В цикле нельзя печатать два раза",
        `range(${n}) вызовет ошибку`,
        "Не хватает двоеточия после for"
      ], [
        "The indentation in the block differs: every line inside for has the same one",
        "A loop cannot print twice",
        `range(${n}) will raise an error`,
        "There is no colon after for"
      ]),
      raises: "IndentationError",
      fix: L(`for i in range(${n}):`, T('    print("Сундук", i)', '    print("Chest", i)'),
        T('    print("Открыт")', '    print("Open")')),
      explanation: T("Все строки одного блока начинаются с одинакового отступа — обычно 4 пробела.",
        "All lines of one block start with the same indentation — usually 4 spaces.")
    };
  });

  copy("control", 2, "if_else", T("Проверка здоровья", "Checking health"), () => ({
    code: L(`hp = ${rnd(0, 50)}`, "if hp > 0:", T('    print("Жив")', '    print("Alive")'), "else:",
      T('    print("Пал")', '    print("Fallen")')),
    explanation: T("if проверяет условие, а else срабатывает, когда оно ложно. Тела веток пишут с отступом.",
      "if checks the condition, and else runs when it is false. The bodies of the branches are indented.")
  }));

  copy("control", 2, "for_range", T("Шаги по коридору", "Steps along the corridor"), () => {
    const n = rnd(3, 5);
    return {
      code: L(`for i in range(${n}):`, T('    print("Шаг", i)', '    print("Step", i)')),
      explanation: T(`range(${n}) даёт числа от 0 до ${n - 1}, и цикл печатает каждое.`,
        `range(${n}) gives the numbers from 0 to ${n - 1}, and the loop prints each one.`)
    };
  });

  copy("control", 3, "countdown", T("Обратный отсчёт", "Countdown"), () => ({
    code: L(`n = ${rnd(3, 5)}`, "while n > 0:", "    print(n)", "    n -= 1",
      T('print("В бой!")', 'print("To battle!")')),
    explanation: T("while повторяет тело, пока n > 0, а n -= 1 уменьшает счётчик, чтобы цикл закончился.",
      "while repeats the body while n > 0, and n -= 1 lowers the counter so the loop ends.")
  }));

  copy("control", 4, "search", T("Поиск ключа", "Searching for the key"), () => ({
    code: L("for room in range(1, 10):", `    if room == ${rnd(2, 6)}:`,
      T('        print("Ключ в комнате", room)', '        print("Key in room", room)'), "        break"),
    explanation: T("Цикл перебирает комнаты, а break останавливает его, как только ключ найден.",
      "The loop walks the rooms, and break stops it as soon as the key is found.")
  }));

  // ================= Списки, словари, множества =================

  fill("collections", 1, "first_item", T("Первый предмет", "The first item"), () => {
    const item = pick(T(["меч", "щит", "лук"], ["sword", "shield", "bow"]));
    return {
      code: L(`bag = [${str(item)}, ${str(T("зелье", "potion"))}]`, "print(bag[___])" + says(item)),
      options: ["0", "1", "2", "-1"],
      expect: item,
      explanation: T("Первый элемент списка имеет индекс 0: bag[0] — это первый предмет.",
        "The first list item has index 0: bag[0] is the first item.")
    };
  });

  fill("collections", 2, "append", T("Пополни сумку", "Fill the bag"), () => {
    const items = sample(SHORT_ITEMS, 3);
    const bag = items.slice(0, rnd(1, 2));
    const added = bag.concat([items[2]]);
    return {
      code: L(`bag = ${strList(bag)}`, `bag.___(${str(items[2])})`, "print(bag)" + says(shownList(added))),
      options: ["append", "add", "push", "extend"],
      expect: shownList(added),
      explanation: T(`append() добавляет элемент в конец списка. extend() разобрал бы строку ${str(items[2])} на отдельные буквы.`,
        `append() adds one item to the end of the list. extend() would split the string ${str(items[2])} into separate letters.`)
    };
  });

  fill("collections", 2, "len", T("Сколько предметов", "How many items"), () => {
    const bag = sample(SHORT_ITEMS, rnd(2, 4));
    return {
      code: L(`bag = ${strList(bag)}`, "print(___(bag))" + says(bag.length)),
      options: ["len", "sum", "max", "count"],
      expect: String(bag.length),
      explanation: T(`len() считает элементы списка: их ${bag.length}.`,
        `len() counts the list items: there are ${bag.length}.`)
    };
  });

  fill("collections", 2, "index", T("Предмет по номеру", "An item by number"), () => {
    const bag = sample(SHORT_ITEMS, 4);
    const at = { "0": bag[0], "1": bag[1], "2": bag[2], "-1": bag[3] };
    const right = pick(Object.keys(at));
    return {
      code: L(`bag = ${strList(bag)}`, "print(bag[___])" + says(at[right])),
      options: [right].concat(Object.keys(at).filter((i) => i !== right)),
      expect: at[right],
      explanation: T(`Номера элементов списка считаются с нуля: bag[0] — «${bag[0]}», bag[1] — «${bag[1]}», ` +
        `а bag[-1] — последний, «${bag[3]}».`,
        `List item numbers start at zero: bag[0] is “${bag[0]}”, bag[1] is “${bag[1]}”, ` +
        `and bag[-1] is the last one, “${bag[3]}”.`)
    };
  });

  fill("collections", 3, "last", T("Последний предмет", "The last item"), () => {
    const bag = sample(SHORT_ITEMS, rnd(3, 4));
    const n = bag.length;
    return {
      code: L(`bag = ${strList(bag)}`, "print(bag[___])" + says(bag[n - 1])),
      options: ["-1", String(n), "len(bag)", "0"],
      expect: bag[n - 1],
      explanation: T(`Последний элемент — bag[-1]. Индекс ${n} (он же len(bag)) уже за концом списка: номера идут от 0 до ${n - 1}.`,
        `The last item is bag[-1]. The index ${n} (which is len(bag)) is already past the end: numbers run from 0 to ${n - 1}.`)
    };
  });

  fill("collections", 3, "dict_key", T("Запись героя", "The hero's record"), () => {
    const hp = rnd(50, 100);
    const gold = rnd(5, 40);
    const key = pick(["hp", "gold"]);
    return {
      code: L(`hero = {"hp": ${hp}, "gold": ${gold}}`, "print(hero[___])" + says(key === "hp" ? hp : gold)),
      options: [str(key), key, str(key === "hp" ? "gold" : "hp"), "0"],
      expect: String(key === "hp" ? hp : gold),
      explanation: T(`Значение в словаре берут по ключу: hero[${str(key)}]. Ключ здесь — строка, поэтому в кавычках.`,
        `A dictionary value is fetched by key: hero[${str(key)}]. The key is a string here, so it needs quotes.`)
    };
  });

  fill("collections", 3, "dict_get", T("Безопасное чтение", "Safe reading"), () => {
    const d = rnd(0, 5) * 10;
    return {
      code: L(`hero = {"hp": ${rnd(50, 99)}}`, `print(hero.get("mana", ___))` + says(d)),
      options: [String(d), str("mana"), "None", "mana"],
      expect: String(d),
      explanation: T(`get(ключ, запасное) возвращает запасное значение, если ключа нет. Ключа "mana" нет — получаем ${d}.`,
        `get(key, fallback) returns the fallback when the key is missing. There is no "mana" key, so we get ${d}.`)
    };
  });

  fill("collections", 3, "in_list", T("Есть ли ключ", "Is the key there"), () => {
    const keyWord = T("ключ", "key");
    const bag = shuffle(sample(ITEMS.filter((x) => x !== keyWord), 2).concat([keyWord]));
    const msg = T("Дверь открыта", "The door is open");
    return {
      code: L(`bag = ${strList(bag)}`, `if ${str(keyWord)} ___ bag:`, `    print(${str(msg)})` + says(msg)),
      options: ["in", "not in", "==", "of"],
      expect: msg,
      explanation: T("in проверяет, есть ли элемент в списке. Ключ в сумке есть — условие верно.",
        "in checks whether an item is in the list. The key is in the bag, so the condition is true.")
    };
  });

  fill("collections", 3, "pop", T("Достань последнее", "Take the last one"), () => {
    const bag = sample(ITEMS, 3);
    return {
      code: L(`bag = ${strList(bag)}`, "last = bag.___()", "print(last)" + says(bag[2])),
      options: ["pop", "remove", "clear", "copy"],
      expect: bag[2],
      explanation: T("pop() убирает из списка последний элемент и возвращает его.",
        "pop() removes the last item from the list and returns it.")
    };
  });

  fill("collections", 3, "dict_change", T("Лечение героя", "Healing the hero"), () => {
    const hp = rnd(30, 60);
    const k = rnd(10, 30);
    return {
      code: L(`hero = {"hp": ${hp}}`, `hero["hp"] ___ ${k}`, 'print(hero["hp"])' + says(hp + k)),
      options: ["+=", "=", "-=", "=="],
      expect: String(hp + k),
      explanation: T(`hero["hp"] += ${k} прибавляет ${k} к значению по ключу: ${hp} + ${k} = ${hp + k}.`,
        `hero["hp"] += ${k} adds ${k} to the value under the key: ${hp} + ${k} = ${hp + k}.`)
    };
  });

  fill("collections", 3, "dict_new_key", T("Новая запись", "A new record"), () => {
    const hp = rnd(30, 90);
    const m = rnd(10, 50);
    const shown = `{'hp': ${hp}, 'mana': ${m}}`;
    return {
      code: L(`hero = {"hp": ${hp}}`, `hero[___] = ${m}`, "print(hero)" + says(shown)),
      options: [str("mana"), "mana", str("hp"), "1"],
      expect: shown,
      explanation: T(`Новый ключ появляется в словаре, когда ему присваивают значение: hero["mana"] = ${m}.`,
        `A new key appears in the dictionary when it is given a value: hero["mana"] = ${m}.`)
    };
  });

  fill("collections", 3, "sum", T("Общий урон", "Total damage"), () => {
    let d;
    do {
      d = [rnd(3, 15), rnd(3, 15), rnd(3, 15)];
    } while (!distinct([d[0] + d[1] + d[2], 3, Math.max(d[0], d[1], d[2]), Math.min(d[0], d[1], d[2])]));
    const s = d[0] + d[1] + d[2];
    return {
      code: L(`hits = ${numList(d)}`, "print(___(hits))" + says(s)),
      options: ["sum", "len", "max", "min"],
      expect: String(s),
      explanation: T(`sum() складывает все числа списка: ${d.join(" + ")} = ${s}.`,
        `sum() adds up every number in the list: ${d.join(" + ")} = ${s}.`)
    };
  });

  fill("collections", 4, "comprehension", T("Список одной строкой", "A list in one line"), () => {
    const ops = ["**", "*", "+", "//"];
    const calc = { "**": (x) => x * x, "*": (x) => x * 2, "+": (x) => x + 2, "//": (x) => Math.floor(x / 2) };
    let nums;
    let lists;
    do {
      nums = sample([1, 2, 3, 4, 5, 6, 7], 3).sort((a, b) => a - b);
      lists = ops.map((o) => numList(nums.map(calc[o])));
    } while (!distinct(lists));
    const right = pick(["**", "*"]);
    const want = lists[ops.indexOf(right)];
    return {
      code: L(`nums = ${numList(nums)}`, "res = [x ___ 2 for x in nums]", "print(res)" + says(want)),
      options: [right].concat(ops.filter((o) => o !== right)),
      expect: want,
      explanation: right === "**"
        ? T("x ** 2 — квадрат числа. Генератор списка применяет выражение к каждому x.",
          "x ** 2 is the square of a number. A list comprehension applies the expression to every x.")
        : T("x * 2 удваивает число. Генератор списка применяет выражение к каждому x.",
          "x * 2 doubles a number. A list comprehension applies the expression to every x.")
    };
  });

  fill("collections", 4, "items", T("Цены в лавке", "Prices at the stall"), () => {
    const goods = sample(ITEMS, 2);
    const p = [rnd(10, 60), rnd(10, 60)];
    return {
      code: L(`prices = {${str(goods[0])}: ${p[0]}, ${str(goods[1])}: ${p[1]}}`, "for name, price in prices.___():", "    print(name, price)"),
      options: ["items", "keys", "values", "get"],
      expect: `${goods[0]} ${p[0]}\n${goods[1]} ${p[1]}`,
      explanation: T("items() отдаёт пары «ключ, значение», и их раскладывают в две переменные: name и price.",
        "items() yields pairs of key and value, and they are unpacked into two variables: name and price.")
    };
  });

  fill("collections", 4, "enumerate", T("Нумерация", "Numbering"), () => {
    const bag = sample(ITEMS, 2);
    return {
      code: L(`bag = ${strList(bag)}`, "for i, item in ___(bag, 1):", "    print(i, item)"),
      options: ["enumerate", "range", "zip", "len"],
      expect: `1 ${bag[0]}\n2 ${bag[1]}`,
      explanation: T("enumerate(bag, 1) даёт пары «номер, элемент», и нумерация начинается с 1.",
        "enumerate(bag, 1) yields pairs of number and item, and the numbering starts at 1.")
    };
  });

  fill("collections", 4, "sort", T("Упорядочь удары", "Sort the hits"), () => {
    let nums;
    let sorted;
    do {
      nums = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
      sorted = nums.slice().sort((a, b) => a - b);
    } while (!distinct([numList(nums), numList(sorted), numList(nums.slice().reverse())]));
    return {
      code: L(`hits = ${numList(nums)}`, "hits.___()", "print(hits)" + says(numList(sorted))),
      options: ["sort", "reverse", "sorted", "order"],
      expect: numList(sorted),
      explanation: T("Метод sort() упорядочивает сам список по возрастанию. sorted — отдельная функция: sorted(hits), а не hits.sorted().",
        "The sort() method orders the list itself, ascending. sorted is a separate function: sorted(hits), not hits.sorted().")
    };
  });

  fill("collections", 4, "set", T("Без повторов", "No duplicates"), () => {
    const two = sample(ITEMS, 2);
    return {
      code: L(`loot = ${strList([two[0], two[1], two[0]])}`, "print(len(___(loot)))" + says(2)),
      options: ["set", "list", "str", "dict"],
      expect: "2",
      explanation: T("set() убирает повторы: из трёх находок разных только две.",
        "set() removes duplicates: of the three finds only two are different.")
    };
  });

  bug("collections", 2, "index_out", T("Где мой предмет?", "Where is my item?"), () => {
    const bag = sample(ITEMS, 2);
    return {
      code: L(`bag = ${strList(bag)}`, "print(bag[2])"),
      options: T([
        "В списке два элемента, их номера 0 и 1: индекса 2 нет",
        "Список нельзя читать по индексу",
        "Нужны круглые скобки: bag(2)",
        "Номера в списке считаются с 1"
      ], [
        "The list has two items, numbered 0 and 1: there is no index 2",
        "A list cannot be read by index",
        "Round brackets are needed: bag(2)",
        "List numbers start at 1"
      ]),
      raises: "IndexError",
      fix: L(`bag = ${strList(bag)}`, "print(bag[1])"),
      explanation: T("Номера считаются с нуля: у списка из двух элементов есть только bag[0] и bag[1].",
        "Numbers start at zero: a list of two items only has bag[0] and bag[1].")
    };
  });

  bug("collections", 3, "missing_key", T("Мана героя", "The hero's mana"), () => {
    const hero = `hero = {"hp": ${rnd(50, 99)}, "gold": ${rnd(5, 50)}}`;
    return {
      code: L(hero, 'print(hero["mana"])'),
      options: T([
        'Ключа "mana" в словаре нет',
        "Словарь нельзя читать по ключу",
        "Ключ пишут без кавычек",
        "Нужно писать hero.mana"
      ], [
        'There is no "mana" key in the dictionary',
        "A dictionary cannot be read by key",
        "The key is written without quotes",
        "You must write hero.mana"
      ]),
      raises: "KeyError",
      fix: L(hero, 'print(hero.get("mana", 0))'),
      explanation: T('Чтение несуществующего ключа даёт KeyError. Если ключа может не быть, берут get: hero.get("mana", 0).',
        'Reading a missing key raises KeyError. When the key may be absent, use get: hero.get("mana", 0).')
    };
  });

  bug("collections", 3, "append_none", T("Пропала сумка", "The bag disappeared"), () => {
    const items = sample(SHORT_ITEMS, 2);
    return {
      code: L(`bag = ${strList([items[0]])}`, `bag = bag.append(${str(items[1])})`, "print(bag)" + wants(shownList(items))),
      options: T([
        "append меняет сам список и возвращает None: присваивать результат не нужно",
        "append можно вызвать только один раз",
        "Нужно писать bag.add",
        "Список нельзя печатать через print"
      ], [
        "append changes the list itself and returns None: its result must not be assigned",
        "append can only be called once",
        "You must write bag.add",
        "A list cannot be printed with print"
      ]),
      expect: shownList(items),
      fix: L(`bag = ${strList([items[0]])}`, `bag.append(${str(items[1])})`, "print(bag)"),
      explanation: T("append меняет список на месте и возвращает None. Строка bag = bag.append(...) затирает сумку этим None.",
        "append changes the list in place and returns None. The line bag = bag.append(...) overwrites the bag with that None.")
    };
  });

  bug("collections", 3, "list_plus_str", T("Новая находка", "A new find"), () => {
    const items = sample(ITEMS, 2);
    return {
      code: L(`bag = ${strList([items[0]])}`, `bag = bag + ${str(items[1])}`, "print(bag)"),
      options: T([
        `К списку можно прибавить только список: нужно bag + [${str(items[1])}]`,
        "Списки нельзя складывать",
        "Сначала нужно вызвать print",
        "В списке может быть только один элемент"
      ], [
        `Only a list can be added to a list: it must be bag + [${str(items[1])}]`,
        "Lists cannot be added",
        "print must be called first",
        "A list can only hold one item"
      ]),
      raises: "TypeError",
      fix: L(`bag = ${strList([items[0]])}`, `bag = bag + [${str(items[1])}]`, "print(bag)"),
      explanation: T("Список складывают только со списком. Один предмет добавляют так: bag + [предмет] или bag.append(предмет).",
        "A list is only added to a list. One item is added like this: bag + [item] or bag.append(item).")
    };
  });

  bug("collections", 3, "remove_missing", T("Выброси лишнее", "Throw out the extra"), () => {
    const items = sample(ITEMS, 3);
    return {
      code: L(`bag = ${strList(items.slice(0, 2))}`, `bag.remove(${str(items[2])})`, "print(bag)"),
      options: T([
        `Удалить можно только то, что есть в списке, а «${items[2]}» там нет`,
        "remove удаляет только последний элемент",
        "Нужно писать bag.delete",
        "Список нельзя менять после создания"
      ], [
        `Only something in the list can be removed, and “${items[2]}” is not there`,
        "remove deletes only the last item",
        "You must write bag.delete",
        "A list cannot be changed after it is created"
      ]),
      raises: "ValueError",
      fix: L(`bag = ${strList(items.slice(0, 2))}`, `if ${str(items[2])} in bag:`, `    bag.remove(${str(items[2])})`, "print(bag)"),
      explanation: T(`remove ищет элемент и падает с ValueError, если его нет. Сначала можно проверить: if ${str(items[2])} in bag.`,
        `remove looks for the item and raises ValueError when it is absent. You can check first: if ${str(items[2])} in bag.`)
    };
  });

  bug("collections", 4, "dict_pairs", T("Прайс-лист", "The price list"), () => {
    const goods = sample(ITEMS, 2);
    const prices = `prices = {${str(goods[0])}: ${rnd(10, 60)}, ${str(goods[1])}: ${rnd(10, 60)}}`;
    return {
      code: L(prices, "for name, price in prices:", "    print(name, price)"),
      options: T([
        "Перебор словаря даёт только ключи: для пар нужен prices.items()",
        "Словарь нельзя перебирать в цикле",
        "Переменная в for может быть только одна",
        "Цены нужно писать в кавычках"
      ], [
        "Looping over a dictionary gives only the keys: pairs need prices.items()",
        "A dictionary cannot be looped over",
        "A for loop can only have one variable",
        "Prices must be written in quotes"
      ]),
      raises: "ValueError",
      fix: L(prices, "for name, price in prices.items():", "    print(name, price)"),
      explanation: T("for x in prices перебирает только ключи. Пары «ключ, значение» отдаёт prices.items().",
        "for x in prices loops over the keys only. Key-value pairs come from prices.items().")
    };
  });

  bug("collections", 4, "tuple_set", T("Координаты героя", "The hero's coordinates"), () => {
    const x = rnd(1, 9);
    const y = rnd(1, 9);
    const nx = rnd(10, 20);
    return {
      code: L(`pos = (${x}, ${y})`, `pos[0] = ${nx}`, "print(pos)"),
      options: T([
        `Кортеж нельзя изменять: нужно создать новый, pos = (${nx}, ${y})`,
        "У кортежа нет элемента с номером 0",
        "print не умеет печатать кортежи",
        "Числа в кортеже должны быть разными"
      ], [
        `A tuple cannot be changed: build a new one, pos = (${nx}, ${y})`,
        "A tuple has no item number 0",
        "print cannot print tuples",
        "The numbers in a tuple must differ"
      ]),
      raises: "TypeError",
      fix: L(`pos = (${x}, ${y})`, `pos = (${nx}, ${y})`, "print(pos)"),
      explanation: T("Кортеж в круглых скобках — неизменяемый: его элементы не перезаписывают. Нужен новый кортеж.",
        "A tuple in round brackets is immutable: its items cannot be overwritten. A new tuple is needed.")
    };
  });

  copy("collections", 2, "append", T("Сумка героя", "The hero's bag"), () => {
    const items = sample(ITEMS, 3);
    return {
      code: L(`bag = ${strList(items.slice(0, 2))}`, `bag.append(${str(items[2])})`, "print(bag)"),
      explanation: T("append() добавляет предмет в конец списка.",
        "append() adds an item to the end of the list.")
    };
  });

  copy("collections", 3, "dict", T("Запись героя", "The hero's record"), () => ({
    code: L(`hero = {"hp": ${rnd(50, 99)}, "gold": ${rnd(5, 50)}}`, 'print(hero["gold"])'),
    explanation: T("Словарь хранит пары «ключ: значение», а значение берут по ключу в квадратных скобках.",
      "A dictionary stores key: value pairs, and the value is fetched by key in square brackets.")
  }));

  copy("collections", 3, "loop", T("Обход сумки", "Walking the bag"), () => ({
    code: L(`for item in ${strList(sample(SHORT_ITEMS, 3))}:`, "    print(item)"),
    explanation: T("Цикл for по очереди берёт каждый элемент списка.",
      "A for loop takes every list item in turn.")
  }));

  copy("collections", 4, "items", T("Лавка", "The stall"), () => {
    const goods = sample(ITEMS, 2);
    return {
      code: L(`prices = {${str(goods[0])}: ${rnd(10, 60)}, ${str(goods[1])}: ${rnd(10, 60)}}`,
        "for name, price in prices.items():", "    print(name, price)"),
      explanation: T("items() даёт пары «ключ, значение» для цикла.",
        "items() gives key-value pairs for the loop.")
    };
  });

  copy("collections", 4, "squares", T("Квадраты", "Squares"), () => ({
    code: L(`nums = ${numList(sample([1, 2, 3, 4, 5, 6], 4).sort((a, b) => a - b))}`, "squares = [x * x for x in nums]", "print(squares)"),
    explanation: T("Генератор списка применяет выражение x * x к каждому элементу.",
      "A list comprehension applies the expression x * x to every item.")
  }));

  // ================= Функции =================

  fill("functions", 1, "hello_call", T("Позови функцию", "Call the function"), () => {
    const word = pick(T(["привет", "ура", "вперёд"], ["hi", "hooray", "forward"]));
    return {
      code: L("def hello():", `    return ${str(word)}`, "", "print(___)" + says(word)),
      options: ["hello()", "hello", str("hello"), "print(hello)"],
      expect: word,
      explanation: T("Функцию вызывают по имени и со скобками: hello(). Без скобок print покажет саму функцию, а не её результат.",
        "A function is called by name with brackets: hello(). Without them print shows the function itself, not its result.")
    };
  });

  fill("functions", 2, "double_call", T("Удвой урон", "Double the damage"), () => {
    const n = rnd(2, 9);
    return {
      code: L("def double(x):", "    return x * 2", "", "print(double(___))" + says(n * 2)),
      options: [String(n), String(n * 2), String(n + 2), "x"],
      expect: String(n * 2),
      explanation: T(`Аргумент ${n} попадает в x, функция возвращает ${n} * 2 = ${n * 2}.`,
        `The argument ${n} goes into x, and the function returns ${n} * 2 = ${n * 2}.`)
    };
  });

  fill("functions", 2, "return_sum", T("Сумма добычи", "The total loot"), () => {
    const a = rnd(2, 9);
    const b = rnd(2, 9);
    return {
      code: L("def total(a, b):", "    return a + b", "", `print(total(___, ${b}))` + says(a + b)),
      options: [String(a), String(b), String(a + b), "total"],
      expect: String(a + b),
      explanation: T(`Первый аргумент попадает в a, второй ${b} — в b. При a=${a} функция возвращает ${a} + ${b} = ${a + b}.`,
        `The first argument goes into a, the second, ${b}, into b. With a=${a} the function returns ${a} + ${b} = ${a + b}.`)
    };
  });

  fill("functions", 2, "call_return", T("Забери результат", "Take the result"), () => {
    const n = rnd(10, 40);
    const k = pick([5, 7, 10]);
    return {
      code: L("def heal(hp):", `    return hp + ${k}`, "", `print(heal(___))` + says(n + k)),
      options: [String(n), String(n + k), String(k), "hp"],
      expect: String(n + k),
      explanation: T(`Аргумент попадает в параметр hp, и функция возвращает hp + ${k}: ${n} + ${k} = ${n + k}.`,
        `The argument goes into the parameter hp, and the function returns hp + ${k}: ${n} + ${k} = ${n + k}.`)
    };
  });

  bug("functions", 2, "no_return", T("Забытое return", "The forgotten return"), () => {
    const n = rnd(2, 9);
    return {
      code: L("def double(x):", "    x * 2", "", `print(double(${n}))` + wants(n * 2)),
      options: T([
        "Функция ничего не возвращает: перед x * 2 нужен return",
        "Параметр должен называться так же, как аргумент",
        "Нужно вызвать функцию дважды",
        "print нельзя писать после def"
      ], [
        "The function returns nothing: x * 2 needs return in front of it",
        "The parameter must be named like the argument",
        "The function must be called twice",
        "print cannot be written after def"
      ]),
      expect: String(n * 2),
      fix: L("def double(x):", "    return x * 2", "", `print(double(${n}))`),
      explanation: T("Без return функция выполняет x * 2 и всё равно возвращает None — поэтому print показывает None. " +
        "return отдаёт результат наружу.",
        "Without return the function computes x * 2 and still returns None, so print shows None. " +
        "return hands the result back out.")
    };
  });

  fill("functions", 3, "def", T("Объяви функцию", "Declare a function"), () => {
    const hero = pick(HEROES);
    const hello = T("Привет,", "Hello,");
    return {
      code: L("___ greet(name):", `    print(${str(hello)}, name)`, "", `greet(${str(hero)})` + says(hello + " " + hero)),
      options: ["def", "function", "func", "fun"],
      expect: hello + " " + hero,
      explanation: T("Функцию в Python объявляют словом def: def имя(параметры):",
        "A Python function is declared with the word def: def name(parameters):")
    };
  });

  fill("functions", 3, "return", T("Верни результат", "Return the result"), () => {
    const f = pick([
      { name: "double", body: "x * 2", calc: (x) => x * 2 },
      { name: "triple", body: "x * 3", calc: (x) => x * 3 },
      { name: "add_ten", body: "x + 10", calc: (x) => x + 10 }
    ]);
    const n = rnd(2, 12);
    return {
      code: L(`def ${f.name}(x):`, `    ___ ${f.body}`, "", `print(${f.name}(${n}))` + says(f.calc(n))),
      options: ["return", "print", "pass", "yield"],
      expect: String(f.calc(n)),
      explanation: T("return отдаёт результат туда, где функцию вызвали. print, pass и yield этого не делают.",
        "return hands the result back to where the function was called. print, pass and yield do not.")
    };
  });

  fill("functions", 3, "argument", T("Подлечи героя", "Heal the hero"), () => {
    const n = rnd(20, 60);
    const k = pick([10, 20, 30]);
    return {
      code: L("def heal(hp):", `    return hp + ${k}`, "", "print(heal(___))" + says(n + k)),
      options: [String(n), String(n + k), String(k), "hp"],
      expect: String(n + k),
      explanation: T(`Аргумент ${n} попадает в параметр hp, и функция возвращает ${n} + ${k} = ${n + k}.`,
        `The argument ${n} goes into the parameter hp, and the function returns ${n} + ${k} = ${n + k}.`)
    };
  });

  fill("functions", 3, "param", T("Параметр урона", "The damage parameter"), () => {
    const hp = rnd(60, 120);
    const d = rnd(10, 40);
    return {
      code: L("def hit(hp, ___):", "    return hp - damage", "", `print(hit(${hp}, ${d}))` + says(hp - d)),
      options: ["damage", "hp", String(d), "dmg"],
      expect: String(hp - d),
      explanation: T("Внутри функции используется имя damage, значит, так и должен называться второй параметр.",
        "The function body uses the name damage, so the second parameter must be called that too.")
    };
  });

  fill("functions", 3, "call", T("Вызови функцию", "Call the function"), () => {
    const f = pick(T([["roar", "Р-р-р!"], ["battle_cry", "За короля!"], ["hello", "Привет!"]],
      [["roar", "Grrr!"], ["battle_cry", "For the king!"], ["hello", "Hello!"]]));
    return {
      code: L(`def ${f[0]}():`, `    return ${str(f[1])}`, "", "print(___)" + says(f[1])),
      options: [`${f[0]}()`, f[0], str(f[0]), `${f[0]}[]`],
      expect: f[1],
      explanation: T(`Чтобы функция выполнилась, её вызывают со скобками: ${f[0]}(). Без скобок print покажет саму функцию.`,
        `For a function to run, it is called with brackets: ${f[0]}(). Without them print shows the function itself.`)
    };
  });

  fill("functions", 4, "default", T("Значение по умолчанию", "The default value"), () => {
    const p = rnd(5, 20);
    const b = rnd(2, 9);
    return {
      code: L("def attack(power, bonus=___):", "    return power + bonus", "", `print(attack(${p}))` + says(p + b)),
      options: [String(b), String(p + b), String(p), "0"],
      expect: String(p + b),
      explanation: T(`bonus при вызове не передали, поэтому берётся значение по умолчанию: ${p} + ${b} = ${p + b}.`,
        `bonus is not passed in the call, so its default is used: ${p} + ${b} = ${p + b}.`)
    };
  });

  fill("functions", 4, "keyword", T("Аргументы по имени", "Arguments by name"), () => {
    const w = rnd(6, 12);
    const h = rnd(1, 5);
    return {
      code: L("def room(w, h):", "    return w - h", "", `print(room(h=${h}, ___=${w}))` + says(w - h)),
      options: ["w", "h", "x", "room"],
      expect: String(w - h),
      explanation: T(`Аргументы можно передавать по имени в любом порядке: h=${h}, w=${w}, и функция считает ${w} - ${h} = ${w - h}.`,
        `Arguments can be passed by name in any order: h=${h}, w=${w}, and the function computes ${w} - ${h} = ${w - h}.`)
    };
  });

  fill("functions", 4, "return_bool", T("Жив ли герой", "Is the hero alive"), () => {
    const hp = rnd(5, 60);
    return {
      code: L("def is_alive(hp):", "    return hp ___ 0", "", `print(is_alive(${hp}))` + says("True")),
      options: [">", "<", "==", "<="],
      expect: "True",
      explanation: T(`Герой жив, пока здоровье больше нуля: hp > 0. Для ${hp} это True.`,
        `The hero is alive while health is above zero: hp > 0. For ${hp} that is True.`)
    };
  });

  bug("functions", 3, "def_colon", T("Заклинание не работает", "The spell does not work"), () => {
    const f = pick([
      ["heal", "hp", "hp + 20"],
      ["double", "x", "x * 2"],
      ["greet", "name", T('"Привет, " + name', '"Hello, " + name')]
    ]);
    return {
      code: L(`def ${f[0]}(${f[1]})`, `    return ${f[2]}`),
      options: T([
        `Забыто двоеточие после def ${f[0]}(${f[1]})`,
        "return нельзя писать внутри функции",
        `Параметр ${f[1]} нужно взять в кавычки`,
        `Функцию нельзя называть ${f[0]}`
      ], [
        `The colon after def ${f[0]}(${f[1]}) is missing`,
        "return cannot be written inside a function",
        `The parameter ${f[1]} must be in quotes`,
        `A function cannot be called ${f[0]}`
      ]),
      raises: "SyntaxError",
      fix: L(`def ${f[0]}(${f[1]}):`, `    return ${f[2]}`),
      explanation: T("Строка с def заканчивается двоеточием: за ним идёт тело функции с отступом.",
        "A def line ends with a colon: the indented body of the function follows it.")
    };
  });

  bug("functions", 3, "call_before_def", T("Приветствие не работает", "The greeting does not work"), () => {
    const hero = pick(HEROES);
    const hello = T("Привет,", "Hello,");
    return {
      code: L(`greet(${str(hero)})`, "", "def greet(name):", `    print(${str(hello)}, name)`),
      options: T([
        "Функцию вызывают раньше, чем её объявили",
        "Имя функции должно начинаться с большой буквы",
        "У функции должно быть два параметра",
        "Внутри функции нельзя вызывать print"
      ], [
        "The function is called before it is declared",
        "A function name must start with a capital letter",
        "The function must have two parameters",
        "print cannot be called inside a function"
      ]),
      raises: "NameError",
      fix: L("def greet(name):", `    print(${str(hello)}, name)`, "", `greet(${str(hero)})`),
      explanation: T("Python читает программу сверху вниз: в первой строке функции greet ещё нет. Сначала def, потом вызов.",
        "Python reads the program from top to bottom: on the first line greet does not exist yet. def comes first, the call after it.")
    };
  });

  bug("functions", 3, "missing_arg", T("Зелье не действует", "The potion does nothing"), () => {
    const k = pick([10, 20, 30]);
    return {
      code: L("def heal(hp):", `    return hp + ${k}`, "", "print(heal())"),
      options: T([
        "heal ждёт аргумент hp, а её вызвали без него",
        "return должен стоять перед def",
        "Функцию нельзя вызывать внутри print",
        "У функции не может быть параметров"
      ], [
        "heal expects the argument hp, but it is called without one",
        "return must come before def",
        "A function cannot be called inside print",
        "A function cannot have parameters"
      ]),
      raises: "TypeError",
      fix: L("def heal(hp):", `    return hp + ${k}`, "", "print(heal(50))"),
      explanation: T("У heal есть параметр hp, поэтому при вызове нужно передать значение, например heal(50).",
        "heal has a parameter hp, so a value must be passed in the call, for example heal(50).")
    };
  });

  bug("functions", 3, "print_not_return", T("Удвоенный урон", "Doubled damage"), () => {
    const n = rnd(3, 12);
    return {
      code: L("def double(x):", "    print(x * 2)", "", `result = double(${n})`, "print(result + 1)"),
      options: T([
        "Функция печатает результат, но не возвращает его: нужен return",
        "x нельзя умножать на 2",
        "Переменную result нельзя складывать с числом",
        "Имя double занято самим Python"
      ], [
        "The function prints the result but does not return it: it needs return",
        "x cannot be multiplied by 2",
        "The variable result cannot be added to a number",
        "The name double is taken by Python itself"
      ]),
      raises: "TypeError",
      fix: L("def double(x):", "    return x * 2", "", `result = double(${n})`, "print(result + 1)"),
      explanation: T("Без return функция возвращает None, и в result попадает None. None + 1 — ошибка. print только показывает число на экране.",
        "Without return the function returns None, so result holds None. None + 1 is an error. print only shows the number on screen.")
    };
  });

  bug("functions", 3, "body_indent", T("Монстр молчит", "The monster is silent"), () => {
    const f = pick(T([["roar", "Р-р-р!"], ["cheer", "Ура!"], ["warn", "Осторожно!"]],
      [["roar", "Grrr!"], ["cheer", "Hooray!"], ["warn", "Careful!"]]));
    return {
      code: L(`def ${f[0]}():`, `print(${str(f[1])})`, "", `${f[0]}()`),
      options: T([
        "Тело функции нужно писать с отступом",
        "После def не ставят двоеточие",
        "У функции обязательно должен быть параметр",
        "Функцию нельзя вызывать без print"
      ], [
        "The function body must be indented",
        "There is no colon after def",
        "A function must have a parameter",
        "A function cannot be called without print"
      ]),
      raises: "IndentationError",
      fix: L(`def ${f[0]}():`, `    print(${str(f[1])})`, "", `${f[0]}()`),
      explanation: T("Всё, что входит в функцию, пишут с отступом под строкой def.",
        "Everything that belongs to a function is indented under the def line.")
    };
  });

  bug("functions", 4, "early_return", T("Сумма добычи", "The total loot"), () => {
    const nums = [rnd(2, 9), rnd(2, 9), rnd(2, 9)];
    const s = nums[0] + nums[1] + nums[2];
    return {
      code: L("def total(nums):", "    s = 0", "    for x in nums:", "        s += x", "        return s", "",
        `print(total(${numList(nums)}))` + wants(s)),
      options: T([
        "return стоит внутри цикла: функция выходит после первого числа",
        "s = 0 нужно писать вне функции",
        "Список нельзя передавать в функцию",
        "Вместо s += x нужно s = x"
      ], [
        "return is inside the loop: the function leaves after the first number",
        "s = 0 must be written outside the function",
        "A list cannot be passed to a function",
        "Instead of s += x it must be s = x"
      ]),
      expect: String(s),
      fix: L("def total(nums):", "    s = 0", "    for x in nums:", "        s += x", "    return s", "",
        `print(total(${numList(nums)}))`),
      explanation: T("return сразу завершает функцию, поэтому внутри цикла он срабатывает на первом же числе. " +
        "Его сдвигают на уровень for — тогда он выполнится после цикла.",
        "return ends the function at once, so inside the loop it fires on the very first number. " +
        "Move it to the level of for, and it runs after the loop.")
    };
  });

  bug("functions", 4, "extra_arg", T("Зелье с сюрпризом", "The potion with a surprise"), () => ({
    code: L("def heal(hp):", "    return hp + 20", "", `print(heal(${rnd(30, 60)}, ${rnd(5, 15)}))`),
    options: T([
      "heal принимает один аргумент, а ей передали два",
      "Числа нужно передавать в кавычках",
      "print не может вызывать функции",
      "return должен стоять в конце программы"
    ], [
      "heal takes one argument, but two were passed",
      "Numbers must be passed in quotes",
      "print cannot call functions",
      "return must be at the end of the program"
    ]),
    raises: "TypeError",
    fix: L("def heal(hp):", "    return hp + 20", "", "print(heal(50))"),
    explanation: T("Сколько параметров в def, столько аргументов и передают при вызове. У heal параметр один — hp.",
      "As many parameters as def has, that many arguments are passed in the call. heal has one parameter, hp.")
  }));

  bug("functions", 4, "local_var", T("Золото из функции", "Gold from the function"), () => {
    const n = rnd(10, 90);
    return {
      code: L("def find_gold():", `    gold = ${n}`, "", "find_gold()", "print(gold)"),
      options: T([
        "gold создана внутри функции и снаружи не видна: её нужно вернуть через return",
        "Функцию нужно вызывать с аргументом",
        "Переменную нельзя называть gold",
        "Число нужно взять в кавычки"
      ], [
        "gold is created inside the function and is not visible outside: it must be returned",
        "The function must be called with an argument",
        "A variable cannot be called gold",
        "The number must be in quotes"
      ]),
      raises: "NameError",
      fix: L("def find_gold():", `    return ${n}`, "", "gold = find_gold()", "print(gold)"),
      explanation: T("Переменные, созданные внутри функции, живут только в ней. Наружу значение передают через return.",
        "Variables created inside a function live only there. The value is handed out with return.")
    };
  });

  // ----- Добавлено под лекцию «Python: основы до ООП»: две ловушки -----
  // Изменяемое значение по умолчанию создаётся один раз, при определении функции.
  bug("functions", 4, "default_list", T("Мешок не пустеет", "The bag never empties"), () => {
    const items = sample(ITEMS, 2);
    return {
      code: L(
        "def take(item, bag=[]):",
        "    bag.append(item)",
        "    return bag",
        "",
        `take(${str(items[0])})`,
        `print(len(take(${str(items[1])})))`
      ) + wants("1"),
      options: T([
        "Пустой список в значении по умолчанию создаётся один раз, поэтому мешок общий: нужно bag=None и список внутри",
        "append добавляет предмет дважды",
        "Нужно вернуть bag[:] вместо bag",
        "len считает вызовы функции, а не предметы"
      ], [
        "The empty list in the default value is created once, so the bag is shared: use bag=None and a list inside",
        "append adds the item twice",
        "It must return bag[:] instead of bag",
        "len counts calls, not items"
      ]),
      expect: "1",
      fix: L(
        "def take(item, bag=None):",
        "    if bag is None:",
        "        bag = []",
        "    bag.append(item)",
        "    return bag",
        "",
        `take(${str(items[0])})`,
        `print(len(take(${str(items[1])})))`
      ),
      explanation: T(`Значение по умолчанию создаётся один раз, при определении функции, поэтому «${items[0]}» остаётся в мешке и второй вызов его видит. ` +
        "Безопасный образец: bag=None, а внутри функции if bag is None: bag = [].",
        `The default value is created once, when the function is defined, so “${items[0]}” stays in the bag and the second call sees it. ` +
        "The safe pattern: bag=None, and inside the function if bag is None: bag = [].")
    };
  });

  // return items отдаёт ту же ссылку, а не копию.
  bug("collections", 4, "alias_copy", T("Двойной инвентарь", "Double inventory"), () => {
    const items = sample(ITEMS, 2);
    const extra = pick(ITEMS.filter((w) => !items.includes(w)));
    const list = `[${items.map(str).join(", ")}]`;
    return {
      code: L(
        "def clone(items):",
        "    return items",
        "",
        `old = ${list}`,
        "new = clone(old)",
        `new.append(${str(extra)})`,
        "print(len(old))"
      ) + wants("2"),
      options: T([
        "clone возвращает тот же список: копию делает return items[:]",
        "append добавляет предмет сразу в оба списка",
        "Список нельзя передавать в функцию",
        "Нужно печатать old, а не len(old)"
      ], [
        "clone returns the same list: a copy needs return items[:]",
        "append adds the item to both lists at once",
        "A list cannot be passed to a function",
        "You must print old, not len(old)"
      ]),
      expect: "2",
      fix: L(
        "def clone(items):",
        "    return items[:]",
        "",
        `old = ${list}`,
        "new = clone(old)",
        `new.append(${str(extra)})`,
        "print(len(old))"
      ),
      explanation: T("return items отдаёт ту же ссылку, поэтому new и old — один список, и предмет из new попал в old. " +
        "Копию делает return items[:] или items.copy().",
        "return items hands back the same reference, so new and old are one list, and the item from new landed in old. " +
        "A copy comes from return items[:] or items.copy().")
    };
  });

  copy("functions", 3, "heal", T("Заклинание лечения", "The healing spell"), () => {
    const k = pick([10, 20, 25]);
    return {
      code: L("def heal(hp):", `    return hp + ${k}`, `print(heal(${rnd(30, 70)}))`),
      explanation: T(`def объявляет функцию, return возвращает hp + ${k}, а print выводит результат вызова.`,
        `def declares the function, return gives back hp + ${k}, and print shows the result of the call.`)
    };
  });

  copy("functions", 3, "greet", T("Приветствие", "A greeting"), () => ({
    code: L("def greet(name):", T('    print("Привет,", name)', '    print("Hello,", name)'), `greet(${str(pick(HEROES))})`),
    explanation: T("Функция принимает имя и печатает приветствие.",
      "The function takes a name and prints a greeting.")
  }));

  copy("functions", 4, "default", T("Удар с бонусом", "A strike with a bonus"), () => {
    const b = rnd(2, 6);
    const p = rnd(8, 20);
    return {
      code: L(`def attack(power, bonus=${b}):`, "    return power + bonus", `print(attack(${p}))`, `print(attack(${p}, 1))`),
      explanation: T(`Если bonus не передать, берётся значение по умолчанию ${b}.`,
        `If bonus is not passed, the default ${b} is used.`)
    };
  });

  copy("functions", 4, "total", T("Сумма добычи", "The total loot"), () => ({
    code: L("def total(nums):", "    s = 0", "    for x in nums:", "        s += x", "    return s",
      `print(total(${numList([rnd(2, 9), rnd(2, 9), rnd(2, 9)])}))`),
    explanation: T("Функция складывает числа в цикле и возвращает сумму после него.",
      "The function adds the numbers in a loop and returns the sum after it.")
  }));

  // ================= Исключения =================

  // Что ломает программу: код, название ошибки и её смысл.
  const EXC = [
    { name: "ZeroDivisionError", what: T("деление на ноль", "division by zero"),
      code: () => L("players = 0", `print(${rnd(10, 90)} / players)`) },
    { name: "IndexError", what: T("в списке нет элемента с таким номером", "the list has no item with that number"),
      code: () => L(`bag = ${strList(sample(ITEMS, 2))}`, `print(bag[${rnd(2, 5)}])`) },
    { name: "KeyError", what: T("в словаре нет такого ключа", "the dictionary has no such key"),
      code: () => L(`hero = {"hp": ${rnd(40, 99)}}`, 'print(hero["gold"])') },
    { name: "ValueError", what: T("строку не превратить в число", "the string cannot become a number"),
      code: () => L(`level = int(${str(pick(T(["пять", "три", "много"], ["five", "three", "many"])))})`) },
    { name: "TypeError", what: T("строку и число не сложить", "a string and a number cannot be added"),
      code: () => L(`print("HP: " + ${rnd(10, 99)})`) },
    { name: "NameError", what: T("такого имени нет", "there is no such name"),
      code: () => L(`health = ${rnd(10, 99)}`, "print(helth)") }
  ];

  fill("errors", 1, "except_word", T("Поймай ошибку", "Catch the error"), () => {
    const msg = pick(T(["поймали", "спаслись", "не упали"], ["caught", "saved", "did not crash"]));
    return {
      code: L("try:", "    print(10 / 0)", "___ ZeroDivisionError:", `    print(${str(msg)})` + says(msg)),
      options: ["except", "catch", "else", "finally"],
      expect: msg,
      explanation: T("Ошибку ловят словом except: try содержит опасный код, except — что делать при ошибке.",
        "An error is caught with the word except: try holds the risky code, except says what to do on an error.")
    };
  });

  fill("errors", 2, "which_value", T("Какая ошибка", "Which error"), () => {
    const text = pick(["12a", "3x", "7?"]);
    const msg = T("не число", "not a number");
    return {
      code: L("try:", `    number = int(${str(text)})`, "except ___:", `    print(${str(msg)})` + says(msg)),
      options: ["ValueError", "ZeroDivisionError", "NameError", "TypeError"],
      expect: msg,
      explanation: T("int() не может превратить строку с буквой в число и выбрасывает ValueError. Его и ловит except ValueError.",
        "int() cannot turn a string with a letter into a number and raises ValueError. except ValueError catches it.")
    };
  });

  bug("errors", 1, "missing_paren", T("Забытая скобка", "The forgotten bracket"), () => {
    const word = pick(T(["привет", "ура", "вперёд"], ["hello", "hooray", "forward"]));
    return {
      code: L(`print(${str(word)}`),
      options: T([
        "Не закрыта скобка после строки",
        "В Python нет функции print",
        "Строку нельзя печатать",
        "Нужно поставить точку с запятой"
      ], [
        "The bracket after the string is not closed",
        "Python has no print function",
        "A string cannot be printed",
        "A semicolon is needed"
      ]),
      raises: "SyntaxError",
      fix: L(`print(${str(word)})`),
      explanation: T(`Скобки должны закрываться: print(${str(word)}). Без закрывающей скобки Python не может разобрать строку.`,
        `Brackets must be closed: print(${str(word)}). Without the closing bracket Python cannot parse the line.`)
    };
  });

  bug("errors", 1, "unknown_name", T("Неизвестное имя", "An unknown name"), () => {
    const name = pick(["hero", "player", "mage"]);
    const value = T("Аня", "Ann");
    return {
      code: L(`print(${name})`),
      options: T([
        `Переменная ${name} не определена`,
        `${name} — зарезервированное слово`,
        "print не умеет печатать переменные",
        `Нужно import ${name}`
      ], [
        `The variable ${name} is not defined`,
        `${name} is a reserved word`,
        "print cannot print variables",
        `You need import ${name}`
      ]),
      raises: "NameError",
      fix: L(`${name} = ${str(value)}`, `print(${name})`),
      explanation: T(`Python ищет ${name} среди переменных и не находит. Сначала переменную создают: ${name} = ${str(value)}.`,
        `Python looks for ${name} among the variables and does not find it. The variable is created first: ${name} = ${str(value)}.`)
    };
  });

  bug("errors", 2, "zero", T("Деление на ноль", "Division by zero"), () => {
    const n = rnd(10, 90);
    return {
      code: L(`print(${n} / 0)`),
      options: T([
        "ZeroDivisionError: на ноль делить нельзя",
        "Напечатает 0",
        "Напечатает делимое",
        "SyntaxError: нужен import"
      ], [
        "ZeroDivisionError: nothing can be divided by zero",
        "It will print 0",
        "It will print the dividend",
        "SyntaxError: import is needed"
      ]),
      raises: "ZeroDivisionError",
      fix: L(`print(${n} / 2)`),
      explanation: T("Деление на ноль запрещено, поэтому Python выбрасывает ZeroDivisionError. Делитель стоит проверять условием.",
        "Division by zero is forbidden, so Python raises ZeroDivisionError. The divisor should be checked with a condition.")
    };
  });

  bug("errors", 2, "bad_int", T("Буква в числе", "A letter in a number"), () => {
    const text = pick(["12a", "3x", "7?"]);
    return {
      code: L(`number = int(${str(text)})`, "print(number)"),
      options: T([
        `ValueError: «${text}» не является целым числом`,
        "Напечатает первую цифру",
        `Напечатает ${text}`,
        "NameError: нет int"
      ], [
        `ValueError: “${text}” is not a whole number`,
        "It will print the first digit",
        `It will print ${text}`,
        "NameError: there is no int"
      ]),
      raises: "ValueError",
      fix: L('number = int("12")', "print(number)"),
      explanation: T("int() принимает только целое число целиком. Если в строке есть буква или знак, возникает ValueError.",
        "int() only accepts a complete whole number. A letter or sign in the string raises ValueError.")
    };
  });

  fill("errors", 4, "except", T("Поймай ошибку", "Catch the error"), () => {
    const e = pick(T([
      { body: `print(${rnd(10, 50)} / 0)`, exc: "ZeroDivisionError", msg: "На ноль делить нельзя" },
      { body: `n = int(${str(pick(["пять", "много"]))})`, exc: "ValueError", msg: "Это не число" }
    ], [
      { body: `print(${rnd(10, 50)} / 0)`, exc: "ZeroDivisionError", msg: "No division by zero" },
      { body: `n = int(${str(pick(["five", "many"]))})`, exc: "ValueError", msg: "That is not a number" }
    ]));
    return {
      code: L("try:", "    " + e.body, `___ ${e.exc}:`, `    print(${str(e.msg)})` + says(e.msg)),
      options: ["except", "catch", "else", "finally"],
      expect: e.msg,
      explanation: T("Ошибку ловят парой try и except: опасный код — в try, а что делать при ошибке — в except.",
        "An error is caught by the pair try and except: the risky code in try, what to do in except.")
    };
  });

  fill("errors", 4, "which_except", T("Какую ошибку ловить", "Which error to catch"), () => {
    const pool = EXC.filter((x) => x.name !== "NameError");
    const e = pick(pool);
    const msg = pick(T(["Ошибка поймана", "Герой цел", "Обошлось"], ["The error is caught", "The hero is safe", "It worked out"]));
    return {
      code: L("try:", ...e.code().split("\n").map((row) => "    " + row), "except ___:", `    print(${str(msg)})` + says(msg)),
      options: [e.name].concat(sample(pool.filter((x) => x !== e), 3).map((x) => x.name)),
      expect: msg,
      explanation: T(`Код в try бросает ${e.name} (${e.what}). except ловит только ту ошибку, которую в нём назвали.`,
        `The code in try raises ${e.name} (${e.what}). except only catches the error named in it.`)
    };
  });

  fill("errors", 4, "try", T("Начало ловушки", "The start of the trap"), () => ({
    code: L("___:", `    hp = int(${str(pick(T(["сто", "десять", "много"], ["hundred", "ten", "many"])))})`, "except ValueError:", "    hp = 0", "print(hp)" + says(0)),
    options: ["try", "if", "do", "with"],
    expect: "0",
    explanation: T("Блок, где может случиться ошибка, начинают словом try. Если там ошибка, выполняется except.",
      "A block where an error may happen starts with the word try. If it fails, except runs.")
  }));

  bug("errors", 3, "which", T("Что сломается?", "What will break?"), () => {
    const e = pick(EXC);
    return {
      code: e.code(),
      options: [e.name + ": " + e.what].concat(sample(EXC.filter((x) => x !== e), 3).map((x) => x.name + ": " + x.what)),
      raises: e.name,
      explanation: T(`Здесь будет ${e.name}: ${e.what}.`,
        `This raises ${e.name}: ${e.what}.`)
    };
  });

  bug("errors", 4, "wrong_except", T("Ловушка не сработала", "The trap did not fire"), () => {
    const e = pick(T([
      { body: [`print(${rnd(10, 50)} / 0)`], real: "ZeroDivisionError", caught: "ValueError" },
      { body: [`n = int(${str(pick(["пять", "много"]))})`], real: "ValueError", caught: "ZeroDivisionError" },
      { body: ["bag = []", "print(bag[0])"], real: "IndexError", caught: "KeyError" }
    ], [
      { body: [`print(${rnd(10, 50)} / 0)`], real: "ZeroDivisionError", caught: "ValueError" },
      { body: [`n = int(${str(pick(["five", "many"]))})`], real: "ValueError", caught: "ZeroDivisionError" },
      { body: ["bag = []", "print(bag[0])"], real: "IndexError", caught: "KeyError" }
    ]));
    const body = e.body.map((row) => "    " + row);
    const oops = T("Ошибка!", "An error!");
    return {
      code: L("try:", ...body, `except ${e.caught}:`, `    print(${str(oops)})`),
      options: T([
        `except ловит ${e.caught}, а случится ${e.real}`,
        "После try не ставят двоеточие",
        "Внутри try нельзя вызывать print",
        "После except не пишут имя ошибки"
      ], [
        `except catches ${e.caught}, but ${e.real} will happen`,
        "There is no colon after try",
        "print cannot be called inside try",
        "The error name is not written after except"
      ]),
      raises: e.real,
      fix: L("try:", ...body, `except ${e.real}:`, `    print(${str(oops)})`),
      explanation: T(`except ловит только ту ошибку, которую в нём назвали. Здесь случится ${e.real}, а ловят ${e.caught} — программа всё равно упадёт.`,
        `except only catches the error named in it. Here ${e.real} will happen but ${e.caught} is caught — the program crashes anyway.`)
    };
  });

  bug("errors", 4, "try_alone", T("Осторожное превращение", "A careful conversion"), () => {
    const word = str(pick(T(["сто", "много"], ["hundred", "many"])));
    return {
      code: L("try:", `    hp = int(${word})`, "print(hp)"),
      options: T([
        "После try обязательно нужен блок except",
        "int нельзя писать внутри try",
        "print должен стоять с отступом",
        "try пишут с большой буквы"
      ], [
        "try must be followed by an except block",
        "int cannot be written inside try",
        "print must be indented",
        "try is written with a capital letter"
      ]),
      raises: "SyntaxError",
      fix: L("try:", `    hp = int(${word})`, "except ValueError:", "    hp = 0", "print(hp)"),
      explanation: T("try не живёт один: за ним идёт except (или finally), где сказано, что делать при ошибке.",
        "try never stands alone: except (or finally) follows it and says what to do on an error.")
    };
  });

  copy("errors", 4, "try_int", T("Защита от ошибки", "Protection from an error"), () => ({
    code: L("try:", `    n = int(${str(pick(T(["десять", "сто", "много"], ["ten", "hundred", "many"])))})`, "except ValueError:", `    print(${str(T("Это не число", "That is not a number"))})`),
    explanation: T("try пробует выполнить код, а except ловит ValueError, если строку не превратить в число.",
      "try attempts the code, and except catches ValueError when the string cannot become a number.")
  }));

  copy("errors", 4, "try_div", T("Делёж добычи", "Sharing the loot"), () => ({
    code: L("players = 0", "try:", `    print(${rnd(20, 90)} / players)`, "except ZeroDivisionError:", `    print(${str(T("Некому делить", "Nobody to share with"))})`),
    explanation: T("Деление на ноль бросает ZeroDivisionError, а except её ловит.",
      "Division by zero raises ZeroDivisionError, and except catches it.")
  }));

  // ================= Модули и импорт =================

  fill("modules", 1, "import_short", T("Подключи математику", "Import the maths module"), () => {
    const n = pick([16, 25, 36]);
    return {
      code: L("___ math", `print(math.sqrt(${n}))` + says(Math.sqrt(n).toFixed(1))),
      options: ["import", "include", "using", "require"],
      expect: Math.sqrt(n).toFixed(1),
      explanation: T("Модуль подключают словом import: import math. После этого функции модуля вызывают через точку.",
        "A module is imported with the word import: import math. After that its functions are called through a dot.")
    };
  });

  fill("modules", 2, "from_short", T("Возьми одну функцию", "Take one function"), () => {
    const n = pick([49, 64, 81]);
    return {
      code: L("from math import ___", `print(sqrt(${n}))` + says(Math.sqrt(n).toFixed(1))),
      options: ["sqrt", "math.sqrt", "root", "square"],
      expect: Math.sqrt(n).toFixed(1),
      explanation: T(`from math import sqrt берёт из модуля только sqrt. Вызывать её нужно без math: sqrt(${n}).`,
        `from math import sqrt takes only sqrt from the module. It is called without math: sqrt(${n}).`)
    };
  });

  bug("modules", 2, "no_import_sqrt", T("Корень без модуля", "A root without the module"), () => {
    const n = pick([16, 25, 36, 49, 64]);
    return {
      code: L(`print(sqrt(${n}))`),
      options: T([
        "Имени sqrt нет, пока math не импортирован",
        "sqrt пишут только с заглавной буквы",
        "Корень берут только из чётных чисел",
        "print не умеет печатать дробные числа"
      ], [
        "The name sqrt does not exist until math is imported",
        "sqrt is written with a capital letter only",
        "Roots are only taken from even numbers",
        "print cannot print fractional numbers"
      ]),
      raises: "NameError",
      fix: L("import math", `print(math.sqrt(${n}))`),
      explanation: T("Имя sqrt появляется только после import math или from math import sqrt. Без импорта Python его не знает — NameError.",
        "The name sqrt appears only after import math or from math import sqrt. Without an import Python does not know it — NameError.")
    };
  });

  fill("modules", 2, "floor_call", T("Округли вниз", "Round down"), () => {
    const whole = rnd(2, 20);
    const x = whole + "." + rnd(1, 9);
    return {
      code: L("import math", `print(math.___(${x}))` + says(String(whole))),
      options: ["floor", "ceil", "sqrt", "abs"],
      expect: String(whole),
      explanation: T(`math.floor округляет вниз до целого: ${x} → ${whole}. ceil пошёл бы вверх, sqrt взял корень, abs — модуль.`,
        `math.floor rounds down to a whole number: ${x} → ${whole}. ceil would go up, sqrt takes a root, abs gives the absolute value.`)
    };
  });

  fill("modules", 3, "alias_short", T("Короткое имя модуля", "A short module name"), () => {
    const n = pick([25, 36, 49]);
    return {
      code: L("import math as ___", `print(m.sqrt(${n}))` + says(Math.sqrt(n).toFixed(1))),
      options: ["m", "math", "mod", "math as m"],
      expect: Math.sqrt(n).toFixed(1),
      explanation: T("import math as m даёт модулю короткое имя m. Дальше пишут m.sqrt, а не math.sqrt.",
        "import math as m gives the module the short name m. After that it is m.sqrt, not math.sqrt.")
    };
  });

  bug("modules", 3, "from_but_math", T("Сокращённый импорт", "The short import"), () => {
    const n = pick([16, 25, 36, 49]);
    return {
      code: L("from math import sqrt", `print(math.sqrt(${n}))`),
      options: T([
        "from math import sqrt не создаёт имя math",
        "sqrt работает только после import math as math",
        "sqrt нельзя вызывать с числом в скобках",
        "Сначала нужен print, а потом import"
      ], [
        "from math import sqrt does not create the name math",
        "sqrt only works after import math as math",
        "sqrt cannot be called with a number in brackets",
        "print must come before import"
      ]),
      raises: "NameError",
      fix: L("from math import sqrt", `print(sqrt(${n}))`),
      explanation: T("from math import sqrt берёт из модуля только имя sqrt. Имени math в программе нет, поэтому math.sqrt — NameError. " +
        "Либо import math и math.sqrt(...), либо from math import sqrt и sqrt(...).",
        "from math import sqrt takes only the name sqrt. The name math does not exist, so math.sqrt raises NameError. " +
        "Either import math and math.sqrt(...), or from math import sqrt and sqrt(...).")
    };
  });

  fill("modules", 4, "import", T("Подключи модуль", "Import the module"), () => {
    const n = rnd(2, 12);
    return {
      code: L("___ math", `print(math.sqrt(${n * n}))` + says(n + ".0")),
      options: ["import", "include", "using", "require"],
      expect: n + ".0",
      explanation: T("Модуль подключают словом import: import math. После этого доступны math.sqrt, math.pi и другие.",
        "A module is imported with the word import: import math. Then math.sqrt, math.pi and others are available.")
    };
  });

  fill("modules", 4, "math_func", T("Нужная функция", "The right function"), () => {
    const mode = pick(["sqrt", "floor", "ceil"]);
    const why = T({
      sqrt: "math.sqrt — квадратный корень, он всегда дробный: 16 даёт 4.0.",
      floor: "math.floor округляет вниз, до ближайшего меньшего целого.",
      ceil: "math.ceil округляет вверх, до ближайшего большего целого."
    }, {
      sqrt: "math.sqrt is the square root, and it is always a float: 16 gives 4.0.",
      floor: "math.floor rounds down to the nearest lower whole number.",
      ceil: "math.ceil rounds up to the nearest higher whole number."
    });
    let arg;
    let want;
    if (mode === "sqrt") {
      const n = rnd(2, 12);
      arg = String(n * n);
      want = n + ".0";
    } else {
      const whole = rnd(2, 20);
      arg = whole + "." + rnd(1, 9);
      want = String(mode === "floor" ? whole : whole + 1);
    }
    return {
      code: L("import math", `print(math.___(${arg}))` + says(want)),
      options: [mode].concat(["sqrt", "floor", "ceil", "fabs"].filter((f) => f !== mode)),
      expect: want,
      explanation: why[mode]
    };
  });

  fill("modules", 4, "from_import", T("Число пи", "The number pi"), () => {
    const k = pick([2, 3]);
    const want = k === 2 ? "3.14" : "3.142";
    return {
      code: L("from math import ___", `print(round(pi, ${k}))` + says(want)),
      options: ["pi", "PI", "sqrt", "e"],
      expect: want,
      explanation: T("from math import pi берёт из модуля только pi, и тогда его пишут без math. перед именем.",
        "from math import pi takes only pi from the module, and then it is written without math. in front.")
    };
  });

  fill("modules", 4, "random", T("Бросок кубика", "Rolling a die"), () => {
    const sides = pick([6, 12, 20]);
    return {
      code: L("import random", `roll = random.___(1, ${sides})`, `print(1 <= roll <= ${sides})` + says("True")),
      options: ["randint", "random", "choice", "shuffle"],
      expect: "True",
      explanation: T(`random.randint(1, ${sides}) — случайное целое число от 1 до ${sides} включительно, как бросок кубика.`,
        `random.randint(1, ${sides}) is a random whole number from 1 to ${sides} inclusive, like a die roll.`)
    };
  });

  bug("modules", 4, "no_import", T("Квадратный корень", "The square root"), () => {
    const n = rnd(2, 12);
    return {
      code: `print(math.sqrt(${n * n}))`,
      options: T([
        "Модуль math не подключён: в начале нужно import math",
        "sqrt пишется с большой буквы",
        "Корень можно взять только из 4",
        "math.sqrt пишут без точки"
      ], [
        "The math module is not imported: import math must come first",
        "sqrt is written with a capital letter",
        "A root can only be taken from 4",
        "math.sqrt is written without a dot"
      ]),
      raises: "NameError",
      fix: L("import math", `print(math.sqrt(${n * n}))`),
      explanation: T("Перед тем как пользоваться модулем, его подключают: import math.",
        "Before using a module, it is imported: import math.")
    };
  });

  bug("modules", 4, "bad_name", T("Корень из урона", "The root of the damage"), () => {
    const n = rnd(2, 12);
    const wrong = pick(["squareroot", "root", "sqr"]);
    return {
      code: L("import math", `print(math.${wrong}(${n * n}))`),
      options: T([
        `В модуле math нет функции ${wrong}: корень считает sqrt`,
        "import пишут с большой буквы",
        "Модуль подключают после print",
        "Число в скобках должно быть дробным"
      ], [
        `The math module has no function ${wrong}: the root is computed by sqrt`,
        "import is written with a capital letter",
        "A module is imported after print",
        "The number in brackets must be fractional"
      ]),
      raises: "AttributeError",
      fix: L("import math", `print(math.sqrt(${n * n}))`),
      explanation: T("Python ищет имя внутри модуля и не находит: функция корня в math называется sqrt.",
        "Python looks for the name inside the module and does not find it: the root function in math is called sqrt.")
    };
  });

  bug("modules", 4, "module_call", T("Кубик не бросается", "The die is not rolled"), () => {
    const sides = pick([6, 12, 20]);
    return {
      code: L("import random", `print(random(1, ${sides}))`),
      options: T([
        `random — модуль, а не функция: нужно random.randint(1, ${sides})`,
        "random пишут с большой буквы",
        "Числа должны быть в кавычках",
        "import random нужно писать в конце"
      ], [
        `random is a module, not a function: it must be random.randint(1, ${sides})`,
        "random is written with a capital letter",
        "The numbers must be in quotes",
        "import random must be written at the end"
      ]),
      raises: "TypeError",
      fix: L("import random", `print(random.randint(1, ${sides}))`),
      explanation: T("Модуль — это набор функций, сам он не вызывается. Случайное число даёт функция модуля: random.randint.",
        "A module is a set of functions and cannot be called itself. The random number comes from a module function: random.randint.")
    };
  });

  copy("modules", 4, "sqrt", T("Модуль math", "The math module"), () => ({
    code: L("import math", `print(math.sqrt(${Math.pow(rnd(2, 12), 2)}))`),
    explanation: T("import math подключает модуль, а math.sqrt считает квадратный корень.",
      "import math imports the module, and math.sqrt computes the square root.")
  }));

  copy("modules", 4, "dice", T("Кубик", "The die"), () => ({
    code: L("import random", `roll = random.randint(1, ${pick([6, 12, 20])})`, `print(${str(T("Выпало", "Rolled"))}, roll)`),
    explanation: T("random.randint(a, b) даёт случайное целое число от a до b.",
      "random.randint(a, b) gives a random whole number from a to b.")
  }));

  copy("modules", 4, "circle", T("Площадь круга", "The area of a circle"), () => ({
    code: L("from math import pi", `r = ${rnd(2, 6)}`, "print(round(pi * r ** 2, 1))"),
    explanation: T("from math import pi берёт число пи, а round(..., 1) округляет до десятых.",
      "from math import pi brings in pi, and round(..., 1) rounds to one decimal place.")
  }));

  // ================= «Напиши функцию» =================
  // Код проверяет сервер (/api/check) по проверкам задания: call — вызов,
  // expected — ожидаемое значение, оба на Python. solution — эталон для
  // verify_practice.py, игра его не показывает. В банке таких задач 11, и на
  // «Сложном», где это треть практики, они шли по кругу.

  const code = (topic, level, name, title, make) => add("code", topic, level, name, title, make);
  // Проверка: вызов функции и ожидаемое значение.
  const test = (call, expected) => ({ call: call, expected: String(expected) });
  const py = (v) => (typeof v === "string" ? str(v) : typeof v === "boolean" ? (v ? "True" : "False") : String(v));
  // Аргументы вызова через запятую: строки в кавычках, списки как в Python.
  const args = (...vals) => vals.map((v) => (Array.isArray(v) ? (typeof v[0] === "number" ? numList(v) : strList(v)) : py(v))).join(", ");
  const starter = (sig) => `def ${sig}:\n    pass`;
  // Три разных набора входных данных.
  const inputs = (makeOne) => {
    const out = [];
    const seen = {};
    for (let i = 0; i < 40 && out.length < 3; i++) {
      const v = makeOne(i);
      const k = JSON.stringify(v);
      if (!seen[k]) {
        seen[k] = true;
        out.push(v);
      }
    }
    return out;
  };

  code("operators", 2, "multiply", T("Удар с множителем", "A strike with a multiplier"), () => {
    const k = rnd(2, 5);
    return {
      task: T(`Напиши функцию power_hit(damage), которая возвращает урон, умноженный на ${k}.`,
        `Write a function power_hit(damage) that returns the damage multiplied by ${k}.`),
      starter: starter("power_hit(damage)"),
      tests: inputs(() => rnd(1, 40)).map((d) => test(`power_hit(${d})`, d * k)),
      solution: `def power_hit(damage):\n    return damage * ${k}`,
      explanation: T(`Функция возвращает произведение: return damage * ${k}.`,
        `The function returns the product: return damage * ${k}.`)
    };
  });

  code("operators", 2, "armor", T("Урон сквозь броню", "Damage through armour"), () => ({
    task: T("Напиши функцию damage_after(damage, armor), которая возвращает урон, оставшийся после брони: урон минус броня.",
      "Write a function damage_after(damage, armor) that returns the damage left after armour: damage minus armor."),
    starter: starter("damage_after(damage, armor)"),
    tests: inputs(() => [rnd(20, 60), rnd(1, 19)]).map((v) => test(`damage_after(${v[0]}, ${v[1]})`, v[0] - v[1])),
    solution: "def damage_after(damage, armor):\n    return damage - armor",
    explanation: T("Нужно вернуть разность: return damage - armor.",
      "Return the difference: return damage - armor.")
  }));

  code("operators", 3, "share", T("Делёж добычи", "Sharing the loot"), () => ({
    task: T("Напиши функцию share(gold, heroes), которая возвращает, сколько целых монет достанется каждому герою, если золото поделить поровну.",
      "Write a function share(gold, heroes) that returns how many whole coins each hero gets when the gold is split evenly."),
    starter: starter("share(gold, heroes)"),
    tests: inputs(() => [rnd(10, 99), rnd(2, 6)]).map((v) => test(`share(${v[0]}, ${v[1]})`, Math.floor(v[0] / v[1]))),
    solution: "def share(gold, heroes):\n    return gold // heroes",
    explanation: T("Целую часть от деления даёт //: return gold // heroes. Обычное / вернуло бы дробное число.",
      "// gives the whole part of the division: return gold // heroes. A plain / would return a float.")
  }));

  code("operators", 3, "leftover", T("Остаток добычи", "The leftover loot"), () => ({
    task: T("Напиши функцию leftover(gold, heroes), которая возвращает, сколько монет останется, если поделить золото поровну между героями.",
      "Write a function leftover(gold, heroes) that returns how many coins are left when the gold is split evenly between the heroes."),
    starter: starter("leftover(gold, heroes)"),
    tests: inputs(() => [rnd(10, 99), rnd(2, 6)]).map((v) => test(`leftover(${v[0]}, ${v[1]})`, v[0] % v[1])),
    solution: "def leftover(gold, heroes):\n    return gold % heroes",
    explanation: T("Остаток от деления даёт %: return gold % heroes.",
      "The remainder comes from %: return gold % heroes.")
  }));

  code("types", 3, "parse_gold", T("Золото из записки", "Gold from the note"), () => {
    const k = rnd(2, 20);
    return {
      task: T(`В записке число золота записано строкой, например "15". Напиши функцию parse_gold(text), которая возвращает это число, увеличенное на ${k}.`,
        `The note holds the amount of gold as a string, for example "15". Write a function parse_gold(text) that returns that number increased by ${k}.`),
      starter: starter("parse_gold(text)"),
      tests: inputs(() => rnd(1, 300)).map((n) => test(`parse_gold(${str(n)})`, n + k)),
      solution: `def parse_gold(text):\n    return int(text) + ${k}`,
      explanation: T(`Строку сначала превращают в число: return int(text) + ${k}. Иначе "15" + ${k} — ошибка.`,
        `The string is turned into a number first: return int(text) + ${k}. Otherwise "15" + ${k} is an error.`)
    };
  });

  code("types", 3, "hp_text", T("Надпись над героем", "The sign above the hero"), () => ({
    task: T('Напиши функцию hp_text(hp), которая возвращает строку вида "HP: 30" для любого числа hp.',
      'Write a function hp_text(hp) that returns a string like "HP: 30" for any number hp.'),
    starter: starter("hp_text(hp)"),
    tests: inputs(() => rnd(0, 200)).map((n) => test(`hp_text(${n})`, str("HP: " + n))),
    solution: 'def hp_text(hp):\n    return "HP: " + str(hp)',
    explanation: T('Число превращают в строку и склеивают: return "HP: " + str(hp).',
      'The number is turned into a string and joined: return "HP: " + str(hp).')
  }));

  code("strings", 2, "shout", T("Боевой клич", "A battle cry"), () => ({
    task: T('Напиши функцию shout(word), которая возвращает слово заглавными буквами и с восклицательным знаком: "орк" → "ОРК!".',
      'Write a function shout(word) that returns the word in capitals with an exclamation mark: "orc" → "ORC!".'),
    starter: starter("shout(word)"),
    tests: inputs(() => pick(MONSTERS)).map((w) => test(`shout(${str(w)})`, str(w.toUpperCase() + "!"))),
    solution: 'def shout(word):\n    return word.upper() + "!"',
    explanation: T('upper() делает буквы заглавными, а + добавляет знак: return word.upper() + "!".',
      'upper() makes the letters capitals, and + adds the sign: return word.upper() + "!".')
  }));

  code("strings", 3, "initial", T("Подпись на свитке", "A signature on the scroll"), () => ({
    task: T('Напиши функцию initial(name), которая возвращает первую букву имени с точкой: "Маг" → "М.".',
      'Write a function initial(name) that returns the first letter of the name with a dot: "Mage" → "M."'),
    starter: starter("initial(name)"),
    tests: inputs(() => pick(HEROES)).map((h) => test(`initial(${str(h)})`, str(h[0] + "."))),
    solution: 'def initial(name):\n    return name[0] + "."',
    explanation: T('Первая буква — name[0], к ней приклеиваем точку: return name[0] + ".".',
      'The first letter is name[0], with a dot glued on: return name[0] + "."')
  }));

  code("strings", 3, "count_letter", T("Сколько букв", "How many letters"), () => ({
    task: T("Напиши функцию count_letter(word, letter), которая возвращает, сколько раз буква letter встречается в слове word.",
      "Write a function count_letter(word, letter) that returns how many times the letter appears in the word."),
    starter: starter("count_letter(word, letter)"),
    tests: inputs(() => {
      const w = pick(T(["подземелье", "заклинание", "сокровище", "катакомбы", "лабиринт"],
        ["dungeon", "spellbook", "treasure", "catacombs", "labyrinth"]));
      return [w, pick(w.split(""))];
    }).map((v) => test(`count_letter(${str(v[0])}, ${str(v[1])})`, v[0].split(v[1]).length - 1)),
    solution: "def count_letter(word, letter):\n    return word.count(letter)",
    explanation: T("У строки есть метод count: return word.count(letter).",
      "A string has a count method: return word.count(letter).")
  }));

  code("control", 2, "can_open", T("Тяжёлая дверь", "The heavy door"), () => {
    const k = rnd(2, 5);
    return {
      task: T(`Дверь открывается, если у героя не меньше ${k} ключей. Напиши функцию can_open(keys), которая возвращает True или False.`,
        `The door opens if the hero has at least ${k} keys. Write a function can_open(keys) that returns True or False.`),
      starter: starter("can_open(keys)"),
      tests: [k - 1, k, k + rnd(1, 4)].map((n) => test(`can_open(${n})`, py(n >= k))),
      solution: `def can_open(keys):\n    return keys >= ${k}`,
      explanation: T(`«Не меньше» — это >=: return keys >= ${k}. Сравнение само даёт True или False.`,
        `At least means >=: return keys >= ${k}. The comparison itself gives True or False.`)
    };
  });

  code("control", 3, "heal_cap", T("Лечение до предела", "Healing up to the limit"), () => {
    const top = pick([100, 120, 150]);
    return {
      task: T(`Напиши функцию heal(hp, amount): здоровье растёт на amount, но не может быть больше ${top}. Верни новое здоровье.`,
        `Write a function heal(hp, amount): health grows by amount but cannot exceed ${top}. Return the new health.`),
      starter: starter("heal(hp, amount)"),
      tests: [[top - 50, 20], [top - 10, 30], [top - 5, 5]].map((v) => test(`heal(${v[0]}, ${v[1]})`, Math.min(top, v[0] + v[1]))),
      solution: `def heal(hp, amount):\n    return min(hp + amount, ${top})`,
      explanation: T(`Если сумма больше ${top}, вернуть ${top}: return min(hp + amount, ${top}) или то же через if.`,
        `If the sum exceeds ${top}, return ${top}: return min(hp + amount, ${top}), or the same with if.`)
    };
  });

  code("control", 3, "rank", T("Звание героя", "The hero's rank"), () => {
    const a = pick([50, 100]);
    const b = a * pick([2, 3]);
    const rank = (xp) => (xp < a ? T("новичок", "novice") : xp < b ? T("воин", "warrior") : T("герой", "hero"));
    return {
      task: T(`Напиши функцию rank(xp): если опыта меньше ${a}, вернуть "новичок", если меньше ${b} — "воин", иначе "герой".`,
        `Write a function rank(xp): if the experience is below ${a}, return "${T("новичок", "novice")}"; below ${b}, return "${T("воин", "warrior")}"; otherwise return "${T("герой", "hero")}".`),
      starter: starter("rank(xp)"),
      tests: [rnd(0, a - 1), rnd(a, b - 1), rnd(b, b + 100)].map((x) => test(`rank(${x})`, str(rank(x)))),
      solution: `def rank(xp):\n    if xp < ${a}:\n        return "${T("новичок", "novice")}"\n    elif xp < ${b}:\n        return "${T("воин", "warrior")}"\n    else:\n        return "${T("герой", "hero")}"`,
      explanation: T("Цепочка if — elif — else проверяет условия по порядку и возвращает первое подходящее звание.",
      "The if — elif — else chain checks the conditions in order and returns the first matching rank.")
    };
  });

  code("control", 4, "turns", T("Сколько ударов", "How many strikes"), () => ({
    task: T("Напиши функцию turns(hp, damage), которая возвращает, сколько ударов по damage нужно, чтобы здоровье врага hp стало 0 или меньше.",
      "Write a function turns(hp, damage) that returns how many strikes of damage are needed to bring the enemy health hp to 0 or below."),
    starter: starter("turns(hp, damage)"),
    tests: inputs(() => [rnd(10, 90), rnd(3, 15)]).map((v) => test(`turns(${v[0]}, ${v[1]})`, Math.ceil(v[0] / v[1]))),
    solution: "def turns(hp, damage):\n    count = 0\n    while hp > 0:\n        hp -= damage\n        count += 1\n    return count",
    explanation: T("Цикл while бьёт, пока hp > 0, и считает удары. Можно и формулой: (hp + damage - 1) // damage.",
      "A while loop strikes while hp > 0 and counts the hits. The formula (hp + damage - 1) // damage also works.")
  }));

  code("collections", 3, "has_item", T("Есть ли в сумке", "Is it in the bag"), () => ({
    task: T("Напиши функцию has_item(bag, item), которая возвращает True, если предмет item есть в списке bag, и False, если нет.",
      "Write a function has_item(bag, item) that returns True if the item is in the list bag and False otherwise."),
    starter: starter("has_item(bag, item)"),
    tests: (() => {
      const bag = sample(ITEMS, 3);
      const other = pick(ITEMS.filter((x) => bag.indexOf(x) < 0));
      return [test(`has_item(${args(bag, bag[0])})`, "True"), test(`has_item(${args(bag, other)})`, "False"),
        test(`has_item(${args([bag[1]], bag[1])})`, "True")];
    })(),
    solution: "def has_item(bag, item):\n    return item in bag",
    explanation: T("Оператор in сам отвечает True или False: return item in bag.",
      "The in operator answers True or False itself: return item in bag.")
  }));

  code("collections", 3, "bag_full", T("Полная сумка", "The full bag"), () => {
    const limit = rnd(3, 5);
    return {
      task: T(`Сумка вмещает ${limit} ${plural(limit, "предмет", "предмета", "предметов")}. Напиши функцию bag_full(bag), ` +
        `которая возвращает True, если в списке bag уже ${limit} ${plural(limit, "предмет", "предмета", "предметов")} или больше.`,
        `The bag holds ${limit} ${pluralEn(limit, "item", "items")}. Write a function bag_full(bag) ` +
        `that returns True if the list bag already has ${limit} ${pluralEn(limit, "item", "items")} or more.`),
      starter: starter("bag_full(bag)"),
      tests: [limit - 1, limit, limit + 1].map((n) => test(`bag_full(${strList(sample(ITEMS, n))})`, py(n >= limit))),
      solution: `def bag_full(bag):\n    return len(bag) >= ${limit}`,
      explanation: T(`len(bag) — число предметов. Сумка полна, когда len(bag) >= ${limit}.`,
        `len(bag) is the number of items. The bag is full when len(bag) >= ${limit}.`)
    };
  });

  code("collections", 4, "count_kind", T("Перепись монстров", "Counting the monsters"), () => ({
    task: T("Напиши функцию count_kind(monsters, kind), которая возвращает, сколько раз монстр kind встречается в списке monsters.",
      "Write a function count_kind(monsters, kind) that returns how many times the monster kind appears in the list monsters."),
    starter: starter("count_kind(monsters, kind)"),
    tests: inputs(() => {
      const kinds = sample(MONSTERS, 3);
      const list = [];
      for (let i = 0; i < rnd(4, 6); i++) list.push(pick(kinds));
      return [list, pick(kinds)];
    }).map((v) => test(`count_kind(${args(v[0], v[1])})`, v[0].filter((m) => m === v[1]).length)),
    solution: "def count_kind(monsters, kind):\n    return monsters.count(kind)",
    explanation: T("У списка есть метод count: return monsters.count(kind). Можно и циклом со счётчиком.",
      "A list has a count method: return monsters.count(kind). A loop with a counter also works.")
  }));

  code("collections", 4, "price_of", T("Цена в лавке", "A price at the stall"), () => {
    const goods = sample(ITEMS, 3);
    const prices = goods.slice(0, 2).map(() => rnd(10, 90));
    const dict = `{${str(goods[0])}: ${prices[0]}, ${str(goods[1])}: ${prices[1]}}`;
    return {
      task: T("Напиши функцию price_of(prices, item): верни цену предмета из словаря prices, а если такого предмета нет — 0.",
      "Write a function price_of(prices, item): return the price of the item from the dictionary prices, or 0 if there is no such item."),
      starter: starter("price_of(prices, item)"),
      tests: [test(`price_of(${dict}, ${str(goods[0])})`, prices[0]), test(`price_of(${dict}, ${str(goods[1])})`, prices[1]),
        test(`price_of(${dict}, ${str(goods[2])})`, 0)],
      solution: "def price_of(prices, item):\n    return prices.get(item, 0)",
      explanation: T("get возвращает запасное значение, если ключа нет: return prices.get(item, 0).",
      "get returns the fallback when the key is missing: return prices.get(item, 0).")
    };
  });

  code("collections", 4, "weakest", T("Слабейший удар", "The weakest hit"), () => ({
    task: T("Напиши функцию weakest(hits), которая возвращает самый слабый удар — наименьшее число в списке hits.",
      "Write a function weakest(hits) that returns the weakest hit — the smallest number in the list hits."),
    starter: starter("weakest(hits)"),
    tests: inputs(() => [rnd(5, 40), rnd(5, 40), rnd(5, 40), rnd(5, 40)]).map((v) => test(`weakest(${numList(v)})`, Math.min.apply(null, v))),
    solution: "def weakest(hits):\n    return min(hits)",
    explanation: T("Наименьшее число в списке даёт min: return min(hits).",
      "The smallest number in the list comes from min: return min(hits).")
  }));

  code("functions", 4, "default_bonus", T("Удар с бонусом", "A strike with a bonus"), () => {
    const k = rnd(2, 9);
    return {
      task: T(`Напиши функцию attack(power, bonus=${k}), которая возвращает power + bonus. Если bonus не передали, он равен ${k}.`,
        `Write a function attack(power, bonus=${k}) that returns power + bonus. If bonus is not passed, it equals ${k}.`),
      starter: starter(`attack(power, bonus=${k})`),
      tests: (() => {
        const p = rnd(5, 30);
        const b = rnd(1, 9);
        return [test(`attack(${p})`, p + k), test(`attack(${p}, ${b})`, p + b), test(`attack(0)`, k)];
      })(),
      solution: `def attack(power, bonus=${k}):\n    return power + bonus`,
      explanation: T(`Значение по умолчанию уже записано в def, остаётся вернуть сумму: return power + bonus.`,
        `The default is already in def, so just return the sum: return power + bonus.`)
    };
  });

  code("functions", 4, "heal_twice", T("Двойное зелье", "The double potion"), () => {
    const k = pick([10, 15, 20]);
    return {
      task: T(`Функция heal уже есть: она добавляет ${k} здоровья. Напиши функцию heal_twice(hp), которая лечит дважды — вызывает heal два раза.`,
        `The function heal already exists: it adds ${k} health. Write a function heal_twice(hp) that heals twice — calls heal two times.`),
      starter: `def heal(hp):\n    return hp + ${k}\n\n\ndef heal_twice(hp):\n    pass`,
      tests: inputs(() => rnd(10, 80)).map((n) => test(`heal_twice(${n})`, n + 2 * k)),
      solution: `def heal(hp):\n    return hp + ${k}\n\n\ndef heal_twice(hp):\n    return heal(heal(hp))`,
      explanation: T("Функция может вызывать другую функцию: return heal(heal(hp)) — результат первого лечения идёт во второе.",
      "A function can call another function: return heal(heal(hp)) — the result of the first heal goes into the second.")
    };
  });

  // ================= Сборка задания =================

  // В блоке кода на телефоне помещается около 40 знаков, дальше строка
  // прокручивается вбок, и подсказка «# выведет» в её конце пряталась за
  // краем. Длинную строку делим: код остаётся, подсказка встаёт под ним.
  const MAX_LINE = 38;
  function fitLines(code) {
    return code.split("\n").map((line) => {
      const m = /^(\s*)(.*?)  (# (?:выведет|выведет только|нужно получить|prints|should print)(?: только)?: .*)$/.exec(line);
      if (!m || line.length <= MAX_LINE) return line;
      return m[1] + m[2] + "\n" + m[1] + m[3];
    }).join("\n");
  }

  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  // Задание в том же виде, что и в банке code-tasks.js. Шаблон со
  // случайными числами иногда даёт два одинаковых варианта ответа — такой
  // вариант выбрасываем и собираем заново.
  function build(t) {
    for (let tries = 0; tries < 30; tries++) {
      const v = t.make();
      if ((t.kind === "fill" || t.kind === "error") && (!v.options || v.options.length !== 4 || !distinct(v.options))) continue;
      if (t.kind === "code" && (!v.tests || v.tests.length < 2)) continue;
      // Номер задания — по тому, что ученик узнаёт в лицо: по коду, а у
      // «напиши функцию» — по условию (проверки он не видит). Тот же код с
      // другими вариантами ответа для него то же самое задание.
      const body = t.kind === "code" ? v.task + "|" + v.starter : v.code;
      const task = {
        id: "gen." + t.key + "." + hash(body),
        title: t.title,
        topic: t.topic,
        level: t.level,
        explanation: v.explanation,
        generated: true,
        template: t.key
      };
      if (t.kind === "code") {
        task.task = v.task;
        task.starter = v.starter;
        task.tests = v.tests;
        task.solution = v.solution;
      } else {
        task.code = fitLines(v.code);
      }
      if (t.kind === "copy") {
        task.task = T("Перепиши код в точности так, как он написан.",
          "Copy the code exactly as it is written.") +
          (/\n /.test(v.code) ? T(" Соблюдай отступы!", " Keep the indentation!") : "");
      } else if (t.kind !== "code") {
        task.options = v.options.slice();
        task.answer = 0;
      }
      if (v.expect !== undefined) task.expect = String(v.expect);
      if (v.raises) task.raises = v.raises;
      if (v.fix) task.fix = v.fix;
      return task;
    }
    return null;
  }

  const BY_KEY = {};
  TEMPLATES.forEach((t) => {
    BY_KEY[t.key] = t;
  });

  const api = {
    // Каталог шаблонов: вид, тема и уровень, без самих заданий.
    list: TEMPLATES.map((t) => ({ key: t.key, kind: t.kind, topic: t.topic, level: t.level })),
    // Новое задание по ключу шаблона или null, если такого шаблона нет.
    make: (key) => (BY_KEY[key] ? build(BY_KEY[key]) : null)
  };

  if (typeof window !== "undefined") window.PracticeVariants = api;
})();
