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

let scoreFilter = null
let statFilter = null

function updateCards(cards) {
  cards.forEach(card => {
    if (card.classList.contains(ACTIVE_CLASS)) {
      return;
    }

    const stats = {}
    const statGrid = card.querySelector('[class*="styles_statList"]')
    const statValues = statGrid.querySelectorAll('[class*="styles_statPoint"]')
    let statTotal = 0
    statValues.forEach((stat, i) => {
      const statVal = parseInt(stat.textContent, 10)
      stats[STAT_MAP[i]] = statVal
      statTotal += statVal
    })

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

    const statsHeader = card.querySelectorAll('h3')[0]
    statsHeader.innerHTML = `${statsHeader.innerText} <span style="font-size: 14px">(${statTotal})</span>`

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
      professionName.style = 'line-height: 16px';
      professionName.innerHTML = `${professionName.innerHTML}<br /><span style="font-size: 13px; color: white;">S: ${scores[SKILL_MAP[i]]}</span>`
    })

    if (statFilter && scoreFilter && scores[statFilter] < scoreFilter) {
      card.style.setProperty('opacity', 0.5);
    }

    // Mark the card as annotated so we don't parse it again.
    card.classList.add(ACTIVE_CLASS)
  })
}

function addScoreFilter(sortElem) {
  sortElem.classList.add(ACTIVE_CLASS)

  const left = document.createElement('span');
  left.style.setProperty('margin-left', '32px')
  left.style.setProperty('margin-right', '0')
  left.innerText = 'Highlight';

  const profSelect = document.createElement('select');
  profSelect.innerHTML = `
    <option value=''>None</option>
    <option value='mining'>Mining</option>
    <option value='gardening'>Gardening</option>
    <option value='fishing'>Fishing</option>
    <option value='foraging'>Foraging</option>
  `;
  profSelect.setAttribute('style', `
    background: none;
    color: white;
    border: none;
    padding: 8px;
    margin: 8px;
    cursor: pointer;
    border-bottom: 1px white solid;
  `);
  profSelect.addEventListener('change', e => statFilter = e.currentTarget.value)

  const middle = document.createElement('span');
  middle.innerText = 'Above';

  const scoreInput = document.createElement('input');
  scoreInput.setAttribute('type', 'number');
  scoreInput.addEventListener('change', e => scoreFilter = e.currentTarget.value)
  scoreInput.setAttribute('style', `
    background: none;
    color: white;
    border: none;
    border-bottom: 1px white solid;
    width: 60px;
    padding: 4px;
  `)

  sortElem.appendChild(left)
  sortElem.appendChild(profSelect)
  sortElem.appendChild(middle)
  sortElem.appendChild(scoreInput)
}

const observer = new MutationObserver(function (mutations, obs) {
  const cardElems = document.querySelectorAll('.cardContainer');
  if (cardElems.length) {
    updateCards(cardElems);
  }

  const sortElem = document.querySelector('.sort-wrapper')

  if (sortElem && !sortElem.classList.contains(ACTIVE_CLASS)) {
    addScoreFilter(sortElem)
  }
});

observer.observe(document, {
  childList: true,
  subtree: true
});