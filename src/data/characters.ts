/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterPair, YctLevel } from '../types';

export const UI_TRANSLATIONS: Record<string, any> = {
  zh: {
    start: "开始",
    robot: "单人竞技",
    pk: "对战模式",
    intro: "游戏说明",
    rules: "在规定的时间内，找出目标汉字，找错会扣除1生命值。放大镜可以帮助我们更快地找到目标。",
    rules_en: "Find the odd character in the grid within the time limit. Each wrong click costs 1 life. Use the magnifier to find the target faster!",
    rules_mn: "Дүрэм: Хугацаанд нь багтаж өөр ханзыг ол. Буруу дарвал 1 амь хасагдана. Томруулагч ашиглаж болно.",
    back: "返回",
    home: "首页",
    next: "下一关",
    retry: "再来一次",
    level: "级别",
    lesson: "课次",
    score: "得分",
    time: "时间",
    lives: "生命",
    prepare_title: "眼力练习",
    prepare_desc: "是目标字！",
    random: "随机抽取",
    result_perfect: "火眼金睛",
    result_good: "超级明星",
    result_try_again: "继续努力",
    magnifier: "放大镜",
    ink_smear: "墨水攻击！",
    cooling: "冷却中...",
    win: "获胜！",
    draw: "平局！",
    lose: "失败！"
  },
  en: {
    start: "Start",
    robot: "SOLO",
    pk: "PK",
    intro: "Introduction",
    rules: "Find the odd character in the grid within the time limit. Each wrong click costs 1 life. Use the magnifier to find the target faster!",
    back: "Back",
    home: "Home",
    next: "Next",
    retry: "Retry",
    level: "LEVEL",
    lesson: "LESSON",
    score: "Score",
    time: "Time",
    lives: "Lives",
    prepare_title: "Eye Exercise",
    prepare_desc: "is the target!",
    result_perfect: "Eagle Eyes",
    result_good: "Superstar",
    result_try_again: "Keep it up",
    magnifier: "Magnifier",
    ink_smear: "Ink Smear!",
    cooling: "Cooling...",
    win: "WIN!",
    draw: "DRAW!",
    lose: "LOSE!"
  },
  mn: {
    start: "Эхлэх",
    robot: "Ганцаараа",
    pk: "Тэмцээн",
    intro: "Танилцуулга",
    rules: "Дүрэм: Хугацаанд нь багтаж өөр ханзыг ол. Буруу дарвал 1 амь хасагдана. Томруулагч ашиглаж болно.",
    back: "Буцах",
    home: "Нүүр",
    next: "Дараагийн",
    retry: "Дахин оролдох",
    level: "ТҮВШИН",
    lesson: "ХИЧЭЭЛ",
    score: "Оноо",
    time: "Хугацаа",
    lives: "Амь",
    prepare_title: "Анхааралтай ажигла!",
    prepare_desc: "байх болно!",
    result_perfect: "Хурц хараа!",
    result_good: "Сайн байна! Ингээд үргэлжлүүл!",
    result_try_again: "Ойрхон байлаа! Бүү бууж өг!",
    result_focus: "Дахиад дадлага хий!",
    magnifier: "Томруулагч",
    ink_smear: "Бэх асгарлаа!",
    cooling: "Түр хүлээ...",
    win: "ЯЛАЛТ!",
    draw: "ТЭНЦЭХ!",
    lose: "ЯЛАГДАЛ!"
  }
};

const createLesson = (id: number, pairs: any[]): YctLevel['lessons'][0] => ({
  id,
  pairs: pairs.map(p => ({
    ...p,
    distractorPinyin: p.distractorPinyin || "?",
    distractorTranslation: p.distractorTranslation || { en: "?", mn: "?" },
    difference: p.difference || "Shape"
  }))
});

export const YCT_DATA: YctLevel[] = [
  {
    id: 1,
    lessons: [
      createLesson(1, [{ target: "见", distractor: "贝", pinyin: "jiàn", distractorPinyin: "bèi", translation: { en: "See", mn: "Харах" }, distractorTranslation: { en: "Shell", mn: "Хясаа" } }]),
      createLesson(2, [{ target: "子", distractor: "了", pinyin: "zǐ", distractorPinyin: "le", translation: { en: "Child", mn: "Хүүхэд" }, distractorTranslation: { en: "Finish", mn: "Дуусгах" } }]),
      createLesson(3, [{ target: "八", distractor: "人", pinyin: "bā", distractorPinyin: "rén", translation: { en: "Eight", mn: "Найм" }, distractorTranslation: { en: "Person", mn: "Хүн" } }]),
      createLesson(4, [{ target: "她", distractor: "他", pinyin: "tā", distractorPinyin: "tā", translation: { en: "She", mn: "Тэр (эм)" }, distractorTranslation: { en: "He", mn: "Тэр (эр)" } }]),
      createLesson(5, [{ target: "哪", distractor: "那", pinyin: "nǎ", distractorPinyin: "nà", translation: { en: "Which", mn: "Аль" }, distractorTranslation: { en: "That", mn: "Тэр" } }]),
      createLesson(6, [{ target: "人", distractor: "入", pinyin: "rén", distractorPinyin: "rù", translation: { en: "Person", mn: "Хүн" }, distractorTranslation: { en: "Enter", mn: "Орох" } }]),
      createLesson(7, [{ target: "大", distractor: "太", pinyin: "dà", distractorPinyin: "tài", translation: { en: "Big", mn: "Том" }, distractorTranslation: { en: "Too", mn: "Хэт" } }]),
    ]
  },
  {
    id: 2,
    lessons: [
      createLesson(1, [{ target: "真", distractor: "直", pinyin: "zhēn", distractorPinyin: "zhí", translation: { en: "True", mn: "Үнэн" }, distractorTranslation: { en: "Straight", mn: "Шууд" } }]),
      createLesson(2, [{ target: "买", distractor: "卖", pinyin: "mǎi", distractorPinyin: "mài", translation: { en: "Buy", mn: "Авах" }, distractorTranslation: { en: "Sell", mn: "Зарах" } }]),
      createLesson(3, [{ target: "块", distractor: "快", pinyin: "kuài", distractorPinyin: "kuài", translation: { en: "Piece", mn: "Хэсэг" }, distractorTranslation: { en: "Fast", mn: "Хурдан" } }]),
    ]
  },
  {
    id: 3,
    lessons: [
      createLesson(1, [{ target: "我", distractor: "找", pinyin: "wǒ", distractorPinyin: "zhǎo", translation: { en: "I/Me", mn: "Би" }, distractorTranslation: { en: "Find", mn: "Хайх" } }]),
      createLesson(2, [{ target: "太", distractor: "大", pinyin: "tài", distractorPinyin: "dà", translation: { en: "Too", mn: "Хэт" }, distractorTranslation: { en: "Big", mn: "Том" } }]),
      createLesson(3, [{ target: "问", distractor: "间", pinyin: "wèn", distractorPinyin: "jiān", translation: { en: "Ask", mn: "Асуух" }, distractorTranslation: { en: "Between", mn: "Хооронд" } }]),
      createLesson(4, [{ target: "第", distractor: "弟", pinyin: "dì", distractorPinyin: "dì", translation: { en: "Number", mn: "Дугаар" }, distractorTranslation: { en: "Brother", mn: "Дүү" } }]),
      createLesson(5, [{ target: "己", distractor: "已", pinyin: "jǐ", distractorPinyin: "yǐ", translation: { en: "Self", mn: "Өөрөө" }, distractorTranslation: { en: "Already", mn: "Хэдийн" } }]),
      createLesson(6, [{ target: "块", distractor: "快", pinyin: "kuài", distractorPinyin: "kuài", translation: { en: "Piece", mn: "Хэсэг" }, distractorTranslation: { en: "Fast", mn: "Хурдан" } }]),
      createLesson(7, [{ target: "吧", distractor: "把", pinyin: "ba", distractorPinyin: "bǎ", translation: { en: "Particle", mn: "Туслах үг" }, distractorTranslation: { en: "Hold", mn: "Барих" } }]),
    ]
  },
  {
    id: 4,
    lessons: [
      createLesson(1, [{ target: "千", distractor: "干", pinyin: "qiān", distractorPinyin: "gān", translation: { en: "Thousand", mn: "Мянга" }, distractorTranslation: { en: "Dry", mn: "Хуурай" } }]),
      createLesson(2, [{ target: "午", distractor: "牛", pinyin: "wǔ", distractorPinyin: "niú", translation: { en: "Noon", mn: "Үд" }, distractorTranslation: { en: "Cow", mn: "Үхэр" } }]),
      createLesson(3, [{ target: "卖", distractor: "买", pinyin: "mài", distractorPinyin: "mǎi", translation: { en: "Sell", mn: "Зарах" }, distractorTranslation: { en: "Buy", mn: "Авах" } }]),
      createLesson(4, [{ target: "左", distractor: "在", pinyin: "zuǒ", distractorPinyin: "zài", translation: { en: "Left", mn: "Зүүн" }, distractorTranslation: { en: "At", mn: "Байгаа" } }]),
      createLesson(5, [{ target: "白", distractor: "百", pinyin: "bái", distractorPinyin: "bǎi", translation: { en: "White", mn: "Цагаан" }, distractorTranslation: { en: "Hundred", mn: "Зуу" } }]),
      createLesson(6, [{ target: "子", distractor: "了", pinyin: "zǐ", distractorPinyin: "le", translation: { en: "Child", mn: "Хүүхэд" }, distractorTranslation: { en: "Finish", mn: "Дуусгах" } }]),
    ]
  },
  {
    id: 5,
    lessons: [
      createLesson(1, [{ target: "末", distractor: "未", pinyin: "mò", distractorPinyin: "wèi", translation: { en: "End", mn: "Төгсгөл" }, distractorTranslation: { en: "Not yet", mn: "Араа болоогүй" } }]),
      createLesson(2, [{ target: "晴", distractor: "睛", pinyin: "qíng", distractorPinyin: "jīng", translation: { en: "Sunny", mn: "Цэлмэг" }, distractorTranslation: { en: "Eye", mn: "Нүд" } }]),
      createLesson(3, [{ target: "已", distractor: "己", pinyin: "yǐ", distractorPinyin: "jǐ", translation: { en: "Already", mn: "Хэдийн" }, distractorTranslation: { en: "Self", mn: "Өөрөө" } }]),
      createLesson(4, [{ target: "叉", distractor: "又", pinyin: "chā", distractorPinyin: "yòu", translation: { en: "Fork", mn: "Сэрээ" }, distractorTranslation: { en: "Again", mn: "Дахин" } }]),
      createLesson(5, [{ target: "既", distractor: "即", pinyin: "jì", distractorPinyin: "jí", translation: { en: "Since", mn: "Улмаар" }, distractorTranslation: { en: "Immediate", mn: "Шууд" } }]),
    ]
  },
  {
    id: 6,
    lessons: [
      createLesson(1, [{ target: "万", distractor: "力", pinyin: "wàn", distractorPinyin: "lì", translation: { en: "Ten thousand", mn: "Түм" }, distractorTranslation: { en: "Power", mn: "Хүч" } }]),
      createLesson(2, [{ target: "必", distractor: "心", pinyin: "bì", distractorPinyin: "xīn", translation: { en: "Must", mn: "Заавал" }, distractorTranslation: { en: "Heart", mn: "Зүрх" } }]),
      createLesson(3, [{ target: "级", distractor: "极", pinyin: "jí", distractorPinyin: "jí", translation: { en: "Level", mn: "Зэрэг" }, distractorTranslation: { en: "Extreme", mn: "Маш" } }]),
    ]
  }
];

// Fill remaining
YCT_DATA.forEach(level => {
  if (level.lessons.length < 12) {
    const basePairs = level.lessons.length > 0 ? level.lessons[0].pairs : [];
    for (let j = level.lessons.length + 1; j <= 12; j++) {
      level.lessons.push(createLesson(j, basePairs));
    }
  }
});
