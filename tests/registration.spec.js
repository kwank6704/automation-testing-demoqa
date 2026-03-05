const { test, expect } = require('@playwright/test');
const { RegistrationPage } = require('../pages/RegistrationPage');
const studentData = require('../test-data/studentData.json');
const { getTodayParts } = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────────────────────
// AC1: Happy Path — Submit form with all valid data
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AC1 - Successful Form Submission', () => {
  test('submit form successfully all valid data and show modal', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillAllValidData(studentData.valid);
    await regPage.submit();

    // ตรวจว่า modal โชว์
    await expect(regPage.modal).toBeVisible({ timeout: 5000 });

    // ตรวจ title ของ modal
    const title = await regPage.getModalTitle();
    expect(title).toBe('Thanks for submitting the form');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC2: Mandatory Field Validation
// EP: กลุ่ม mandatory fields ว่าง vs ครบ
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AC2 - Mandatory Field Validation', () => {
  test('should not submit when all mandatory fields are empty', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.submit();

    // modal ต้องไม่โชว์
    await expect(regPage.modal).not.toBeVisible();
  });

  test('should not submit when First Name is missing', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.fillMobile(studentData.valid.mobile);
    await regPage.submit();

    await expect(regPage.modal).not.toBeVisible();
    await expect(regPage.firstNameInput).toHaveValue('');
  });

  test('should not submit when Last Name is missing', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.fillMobile(studentData.valid.mobile);
    await regPage.submit();

    await expect(regPage.modal).not.toBeVisible();
    await expect(regPage.lastNameInput).toHaveValue('');
  });

  test('should not submit when Gender is not selected', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.fillMobile(studentData.valid.mobile);
    await regPage.submit();

    await expect(regPage.modal).not.toBeVisible();
  });

  test('should not submit when Mobile is missing', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.submit();

    await expect(regPage.modal).not.toBeVisible();
    await expect(regPage.mobileInput).toHaveValue('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC3 + AC7: State → City Dynamic Dropdown
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AC3 & AC7 - State and City Dropdown Dependency', () => {
  test('City dropdown should be disabled before State is selected', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    const isDisabled = await regPage.isCityDropdownDisabled();
    expect(isDisabled).toBeTruthy();
  });

  // EP: แต่ละ state เป็นคนละ partition — ทดสอบตัวแทน 2 state
  for (const [state, cities] of Object.entries(studentData.stateCity).slice(0, 2)) {
    test(`City options should match selected state: ${state}`, async ({ page }) => {
      const regPage = new RegistrationPage(page);
      await regPage.goto();

      await regPage.selectState(state);
      const options = await regPage.getCityOptions();

      for (const city of cities) {
        expect(options).toContain(city);
      }
    });
  }

  test('Selecting different state should update city list', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.selectState('NCR');
    const ncrCities = await regPage.getCityOptions();

    await regPage.selectState('Rajasthan');
    const rajCities = await regPage.getCityOptions();

    // city list should เปลี่ยนไป 
    expect(ncrCities).not.toEqual(rajCities);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC4: Subjects — Multi-select tags
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AC4 - Subjects Multi-select Tags', () => {
  test('should add multiple subjects as removable tags', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.addSubject('Maths');
    await regPage.addSubject('Physics');

    // tag โชว์อยู่มั้ยยย
    const tags = page.locator('.subjects-auto-complete__multi-value__label');
    await expect(tags).toHaveCount(2);
    await expect(tags.nth(0)).toHaveText('Maths');
    await expect(tags.nth(1)).toHaveText('Physics');
  });

  test('should be able to remove a subject tag', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.addSubject('Maths');

    // กด remove button ของ tag แรก
    await page.locator('.subjects-auto-complete__multi-value__remove').first().click();

    const tags = page.locator('.subjects-auto-complete__multi-value__label');
    await expect(tags).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC5: Modal displays exact data entered
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AC5 - Modal Data Verification', () => {
  test('Modal should display correct student name from form input', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillAllValidData(studentData.valid);
    await regPage.submit();

    await expect(regPage.modal).toBeVisible({ timeout: 5000 });

    const nameInModal = await regPage.getModalValue('Student Name');
    expect(nameInModal).toBe(`${studentData.valid.firstName} ${studentData.valid.lastName}`);
  });

  test('Modal should display correct mobile from form input', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillAllValidData(studentData.valid);
    await regPage.submit();

    await expect(regPage.modal).toBeVisible({ timeout: 5000 });

    const mobileInModal = await regPage.getModalValue('Mobile');
    expect(mobileInModal).toBe(studentData.valid.mobile);
  });

  test('Close button should dismiss modal and return to form', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillAllValidData(studentData.valid);
    await regPage.submit();
    await expect(regPage.modal).toBeVisible({ timeout: 5000 });

    await regPage.closeModal();

    // ตรวจว่า modal ถูกปิด และ form ยังอยู่
    await expect(regPage.modal).not.toBeVisible({ timeout: 15000 });
    await expect(regPage.firstNameInput).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC6.1: Mobile Validation — EP + BVA
// 
// Partitions:
//   P1 (valid)   : ตัวเลขครบ 10 หลัก       → pass
//   P2 (invalid) : น้อยกว่า 10 หลัก (BVA: 9) → fail
//   P3 (invalid) : มากกว่า 10 หลัก (BVA: 11) → fail
//   P4 (invalid) : มี alphabetic             → fail
//   P5 (invalid) : มี special characters     → fail
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AC6.1 - Mobile Field Validation (EP + BVA)', () => {
  // ฟังก์ชันช่วย: submit แล้วคืน true ถ้า modal ไม่โชว์ (= validation fail)
  async function expectMobileRejected(page, mobileValue) {
    const regPage = new RegistrationPage(page);
    await regPage.goto();
    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.fillMobile(mobileValue);
    await regPage.submit();
    await expect(regPage.modal).not.toBeVisible();
  }

  // P1: valid — 10 หลัก (BVA: ขอบล่าง + ขอบบน)
  test('[EP-P1/BVA] should accept mobile with exactly 10 digits', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();
    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.fillMobile(studentData.mobile.valid_10digits);
    await regPage.submit();
    await expect(regPage.modal).toBeVisible({ timeout: 5000 });
  });

  // P2: invalid — BVA ขอบล่าง (9 หลัก)
  test('[EP-P2/BVA lower] should reject mobile with 9 digits', async ({ page }) => {
    await expectMobileRejected(page, studentData.mobile.invalid_9digits);
  });

  // P3: invalid — BVA ขอบบน (11 หลัก)
  // ลองเล่นจากเว่บละ demoqa input จำกัด maxLength=10 ทำให้ตัวอักษรที่ 11 ถูกตัดออกอัตโนมัติ
  // behavior จริง คือ input รับได้แค่ 10 หลักแรก ถือว่า field enforce boundary ได้
  test('[EP-P3/BVA upper] input should truncate to 10 digits max (maxLength enforced)', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();
    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.fillMobile(studentData.mobile.invalid_11digits);

    // ตรวจว่า input ตัดเหลือ 10 หลัก 
    const actualValue = await regPage.mobileInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(10);
  });

  // P4: invalid — alphabetic
  // demoqa รับ alpha เข้า input ได้ แต่ reject ตอน submit
  test('[EP-P4] should reject submit when mobile contains alphabetic characters', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();
    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.fillMobile(studentData.mobile.invalid_alpha);
    await regPage.submit();
    // form ต้องไม่ผ่าน กะ modal ไม่โชว์
    await expect(regPage.modal).not.toBeVisible();
  });

  // P5: invalid special characters
  test('[EP-P5] should reject submit when mobile contains special characters', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();
    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.fillMobile(studentData.mobile.invalid_special);
    await regPage.submit();
    await expect(regPage.modal).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC6.2: Email Validation — EP
//
// Partitions:
//   P1 (valid)   : name@domain.com              → pass
//   P2 (invalid) : ไม่มี @                      → fail
//   P3 (invalid) : ไม่มี domain หลัง @          → fail
//   P4 (invalid) : ไม่มี prefix ก่อน @          → fail
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AC6.2 - Email Field Validation (EP)', () => {
  async function fillAndSubmitEmail(page, emailValue) {
    const regPage = new RegistrationPage(page);
    await regPage.goto();
    await regPage.fillFirstName(studentData.valid.firstName);
    await regPage.fillLastName(studentData.valid.lastName);
    await regPage.selectGender(studentData.valid.gender);
    await regPage.fillMobile(studentData.valid.mobile);
    await regPage.fillEmail(emailValue);
    await regPage.submit();
    return regPage;
  }

  // P1: valid email
  test('[EP-P1] should accept valid email format', async ({ page }) => {
    const regPage = await fillAndSubmitEmail(page, studentData.email.valid);
    await expect(regPage.modal).toBeVisible({ timeout: 5000 });
  });

  // P2: ไม่มี @
  test('[EP-P2] should reject email without @ symbol', async ({ page }) => {
    const regPage = await fillAndSubmitEmail(page, studentData.email.invalid_no_at);
    await expect(regPage.modal).not.toBeVisible();
  });

  // P3: ไม่มี domain
  test('[EP-P3] should reject email without domain after @', async ({ page }) => {
    const regPage = await fillAndSubmitEmail(page, studentData.email.invalid_no_domain);
    await expect(regPage.modal).not.toBeVisible();
  });

  // P4: ไม่มี prefix
  test('[EP-P4] should reject email without prefix before @', async ({ page }) => {
    const regPage = await fillAndSubmitEmail(page, studentData.email.invalid_no_prefix);
    await expect(regPage.modal).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC6.3: Date of Birth — default เป็นวันปัจจุบัน และเลือกวันได้
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AC6.3 - Date of Birth Field', () => {
  test('DOB input should be interactable via calendar widget', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    const today = getTodayParts();
    await regPage.fillDateOfBirth(today.day, today.month, today.year);

    // ตรวจว่ามีค่าใน input
    const value = await regPage.dobInput.inputValue();
    expect(value).not.toBe('');
  });

  test('DOB should allow selecting a custom date', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    await regPage.fillDateOfBirth('15', 'May', '2000');
    const value = await regPage.dobInput.inputValue();
    expect(value).toContain('2000');
  });
});