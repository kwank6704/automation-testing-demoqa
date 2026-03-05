# Student Registration Form — Automated Test Suite

**URL under test:** https://demoqa.com/automation-practice-form  
**Framework:** Playwright (๋JavaScript)
**RESULT :** https://kwank6704.github.io/MIDTERM_REPORT/

---

## Software Testing Technique: Equivalence Partitioning + Boundary Value Analysis

### Why this technique?

The form has two fields with clear numeric/format constraints that make EP+BVA ideal:

| Field  | Rule | EP Classes | BVA Points |
|--------|------|------------|------------|
| Mobile | Exactly 10 digits, numeric only | Valid (10 digits), Too-short, Too-long, Alpha/Symbol | 9, 10, 11 digits |
| Email  | Must contain `@` + valid domain | Valid format, Missing `@`, Missing domain | N/A |

EP reduces redundant tests by grouping equivalent inputs.  
BVA catches off-by-one bugs at the exact boundaries (9 / 10 / 11 digits).

---

## Project Structure

```
.
.
├── pages/
│   └── RegistrationPage.js
├── picture/
│   └── student.png
├── test-data/
│   └── studentData.json
├── tests/
│   └── registration.spec.js
├── utils/
│   └── helpers.js
├── .gitignore
├── package-lock.json
├── package.json
├── playwright.config.js
├── README.md
└── Student_Registration.pdf

```

---

## Acceptance Criteria Coverage

| AC  | Description | Tests |
|-----|-------------|-------|
| AC#1 | Submit with all valid data | Happy Path suite |
| AC#2 | Mandatory fields (First Name, Last Name, Gender, Mobile) | 5 parameterised tests |
| AC#3 | City dropdown changes based on State | Per state-city mapping |
| AC#4 | Subjects allows multiple tags + remove | 2 tests |
| AC#5 | Modal displays exact submitted data | 2 tests |
| AC#6.1 | Mobile: 10 digits, no alpha/symbols | EP (4 invalid) + BVA (3 boundary) |
| AC#6.2 | Email: must have @ and valid domain | EP (2 valid, 3 invalid) |
| AC#6.3 | DOB defaults to today, allows calendar pick | 2 tests |
| AC#7 | City disabled/empty until State selected | 1 test |

---

## How to Run

```bash
# 1. Install dependencies
npm install
npx playwright install chromium

# 2. Run all tests (headless)
npm test

# 3. Run with browser visible (good for live demo)
npm run test:headed

# 4. View HTML report
npm run test:report

# 5. Debug a specific test
npx playwright test --debug tests/registration.spec.ts
```

---

## Notes for Live Demo

- Tests are grouped by `describe` block matching each AC — easy to navigate
- `RegistrationPage.ts` separates locators from logic — show how POM makes maintenance easy
- `studentData.json` drives the parameterised loops — adding a new case = one JSON entry
- If a new field is added to the form:
  1. Add the locator to `RegistrationPage.ts`
  2. Add test data to `studentData.json`
  3. Add a new `test()` block (or extend an existing `describe`) in `registration.spec.ts`
