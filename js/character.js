// TASK 3: Character creator (events and form validation)
const heroForm = document.querySelector('#hero-form');
heroForm.noValidate = true; // We show our own error messages, not browser popups.

const heroFields = ['name', 'class', 'color', 'attack', 'defense', 'magic', 'speed'];
const skillFields = ['attack', 'defense', 'magic', 'speed'];
const takenNames = ['Nova', 'Alex', 'Shadow', 'Luna'];
const touched = new Set();
const heroSummary = document.querySelector('#hero-form-summary');

function heroInput(field) {
  return document.querySelector(`#hero-${field}`);
}

function readHero() {
  return {
    name: heroInput('name').value.trim(),
    heroClass: heroInput('class').value,
    color: heroInput('color').value,
    attack: Number(heroInput('attack').value),
    defense: Number(heroInput('defense').value),
    magic: Number(heroInput('magic').value),
    speed: Number(heroInput('speed').value)
  };
}

function getHeroErrors(hero) {
  const errors = {}; // Key: field name; Value: message under that field.
  if (!hero.name) errors.name = 'Enter a hero name.';
  else if (!/^[A-Za-z ]{3,16}$/.test(hero.name)) {
    errors.name = 'Use 3–16 letters or spaces only.';
  } else if (takenNames.some(name => name.toLowerCase() === hero.name.toLowerCase())) {
    errors.name = 'This name is already taken.';
  }

  if (!hero.heroClass) errors.class = 'Choose a class.';
  if (!hero.color) errors.color = 'Choose a color.';

  for (const skill of skillFields) {
    const input = heroInput(skill);
    const value = hero[skill];
    if (input.value.trim() === '' || !Number.isInteger(value) || value < 1 || value > 10) {
      errors[skill] = 'Enter a whole number from 1 to 10.';
    }
  }

  // Rule 1: each character class needs one skill of at least 5 points.
  const requiredSkill = { Warrior: 'attack', Mage: 'magic', Ranger: 'speed' }[hero.heroClass];
  if (requiredSkill && !errors[requiredSkill] && hero[requiredSkill] < 5) {
    errors[requiredSkill] = `${hero.heroClass} needs ${requiredSkill} of at least 5.`;
  }

  // Rule 2: only ONE skill is allowed to be 9 or higher.
  const veryHighSkills = skillFields.filter(skill => !errors[skill] && hero[skill] >= 9);
  if (veryHighSkills.length >= 2) {
    errors[veryHighSkills[1]] = 'Only one skill may be 9 or higher.';
  }

  // Rule 3: the allocation must total exactly 20 points.
  const total = hero.attack + hero.defense + hero.magic + hero.speed;
  const allSkillsInRange = skillFields.every(skill =>
    Number.isInteger(hero[skill]) && hero[skill] >= 1 && hero[skill] <= 10 && heroInput(skill).value !== ''
  );
  if (allSkillsInRange && total !== 20 && !errors.speed) {
    errors.speed = `You used ${total} points. The total must be 20.`;
  }
  return errors;
}

function showHeroErrors(errors) {
  for (const field of heroFields) {
    const input = heroInput(field);
    const message = touched.has(field) ? (errors[field] || '') : '';
    // Constraint Validation API stores the JavaScript rule as a custom error.
    input.setCustomValidity(errors[field] || '');
    const valid = input.checkValidity();
    const visibleInvalid = touched.has(field) && !valid;
    input.setAttribute('aria-invalid', String(visibleInvalid));
    document.querySelector(`#error-${field}`).textContent = visibleInvalid ? message : '';
  }
}

function updateHeroPreview(hero) {
  const preview = document.querySelector('#hero-preview');
  for (const color of ['blue', 'violet', 'orange', 'green']) {
    preview.classList.remove(`theme-${color}`);
  }
  preview.classList.add(`theme-${hero.color}`);
  document.querySelector('#preview-name').textContent = hero.name || 'Your hero';
  document.querySelector('#preview-avatar').textContent = hero.name ? hero.name[0].toUpperCase() : '?';
  document.querySelector('#preview-class').textContent = hero.heroClass;
  for (const skill of skillFields) {
    document.querySelector(`#preview-${skill}`).textContent = heroInput(skill).value || '–';
  }
  const total = skillFields.reduce((sum, skill) => sum + hero[skill], 0);
  const counter = document.querySelector('#points-count');
  counter.textContent = `${total} / 20`;
  counter.classList.toggle('over-limit', total !== 20);
}

function validateHero() {
  const hero = readHero();
  const errors = getHeroErrors(hero);
  showHeroErrors(errors);
  updateHeroPreview(hero);
  return errors;
}

// Blur shows the first error. After that, input and change keep it updated.
for (const field of heroFields) {
  const input = heroInput(field);
  input.addEventListener('blur', () => {
    touched.add(field);
    validateHero();
  });
  for (const eventName of ['input', 'change']) {
    input.addEventListener(eventName, () => {
      heroSummary.hidden = true;
      validateHero();
    });
  }
}

function showFinishedHero(hero) {
  const result = document.querySelector('#hero-result');
  result.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = '✓ Character created!';
  const line = document.createElement('p');
  line.textContent = `${hero.name} · ${hero.heroClass}`;
  const details = document.createElement('p');
  details.textContent = `ATK ${hero.attack} / DEF ${hero.defense} / MAG ${hero.magic} / SPD ${hero.speed}`;
  result.append(heading, line, details);
  result.classList.add('is-created');
}

heroForm.addEventListener('submit', event => {
  event.preventDefault();
  for (const field of heroFields) touched.add(field);
  const errors = validateHero();
  const invalidFields = heroFields.filter(field => errors[field]);

  if (invalidFields.length > 0) {
    heroSummary.hidden = false;
    heroSummary.textContent = `Please fix ${invalidFields.length} field${invalidFields.length === 1 ? '' : 's'} before creating your hero.`;
    heroInput(invalidFields[0]).focus();
    return;
  }

  const hero = readHero();
  takenNames.push(hero.name); // The next character cannot reuse this name.
  showFinishedHero(hero);
  heroForm.reset();
  touched.clear();
  heroSummary.hidden = true;
  validateHero();
});

validateHero();
