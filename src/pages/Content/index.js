const dfkWatch = require('./dfkWatch')

console.log('DFK Profession Scores Loaded!');

const ACTIVE_CLASS = 'dfk-ext-active'
const STAT_MAP = ['strength', 'dexterity', 'agility', 'vitality', 'endurance', 'intelligence', 'wisdom', 'luck']
const STAT_ABBR_MAP = {
  'STR': 'strength',
  'DEX': 'dexterity',
  'AGI': 'agility',
  'VIT': 'vitality',
  'END': 'endurance',
  'INT': 'intelligence',
  'WIS': 'wisdom',
  'LCK': 'luck',
}
const SKILL_MAP = ['mining', 'gardening', 'fishing', 'foraging']

function updateCards(cards) {
  cards.forEach(card => {
    if (card.classList.contains(ACTIVE_CLASS)) {
      return;
    }

    const stats = {}
    const statGrid = card.querySelector('[class*="styles_statList"]')
    const statValues = statGrid.querySelectorAll('[class*="styles_statPoint"]')
    statValues.forEach((stat, i) => stats[STAT_MAP[i]] = parseInt(stat.textContent, 10))

    const statBoosts = []
    const statBoost1 = STAT_ABBR_MAP[statGrid.querySelector('[class*="styles_statBoost_"]')?.textContent]
    if (statBoost1) statBoosts.push(statBoost1)
    const statBoost2 = STAT_ABBR_MAP[statGrid.querySelector('[class*="styles_statBoost2_"]')?.textContent]
    if (statBoost2) statBoosts.push(statBoost2)
    const statBoostDouble = STAT_ABBR_MAP[statGrid.querySelector('[class*="styles_statBoostDouble_"]')?.textContent]
    if (statBoostDouble) statBoosts.push(statBoostDouble)

    const professions = {}
    const professionGrid = card.querySelector('[class*="styles_skillList"]')
    const professionLevels = professionGrid.querySelectorAll('[class*="styles_skillLevel"]')
    const professionNames = professionGrid.querySelectorAll('[class*="styles_skillName"]')
    professionLevels.forEach((profession, i) => professions[SKILL_MAP[i]] = parseFloat(profession.textContent))
    const profession = professionGrid.querySelector('[class*="styles_chosen"]').childNodes[0].nodeValue.toLowerCase()

    const classElem = card.querySelector('[class*="styles_class"]');
    const mainClass = classElem.childNodes[0].nodeValue
    const subClass = classElem.children[0].textContent

    const level = parseInt(card.querySelector('[class*="styles_level"]').textContent.split(' ')[1])

    const rarity = card.querySelector('[class*="styles_cardRarity"]').textContent;

    const hero = {
      stats,
      professions,
      level,
      blueGene: statBoost2 || statBoostDouble,
      profession,
      mainClass,
      subClass,
      rarity
    }

    const scores = {
      mining: dfkWatch.valuateProfession(hero, 'mining'),
      fishing: dfkWatch.valuateProfession(hero, 'fishing'),
      gardening: dfkWatch.valuateProfession(hero, 'gardening'),
      foraging: dfkWatch.valuateProfession(hero, 'foraging'),
    }

    professionNames.forEach((professionName, i) => {
      professionName.style = 'line-height: 14px';
      professionName.innerHTML = `${professionName.innerHTML}<br /><span style="font-size: 8px; color: white;">Score: ${scores[SKILL_MAP[i]]}</span>`
    })

    // Mark the card as annotated so we don't parse it again.
    card.classList.add(ACTIVE_CLASS)
  })
}

const observer = new MutationObserver(function (mutations, obs) {
  const elems = document.querySelectorAll('.cardContainer');
  if (elems.length) {
    updateCards(elems);
  }
});

observer.observe(document, {
  childList: true,
  subtree: true
});