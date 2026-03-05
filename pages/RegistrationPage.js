class RegistrationPage {
  constructor(page) {
    this.page = page;

    // Locators 
    this.firstNameInput    = page.locator('#firstName');
    this.lastNameInput     = page.locator('#lastName');
    this.emailInput        = page.locator('#userEmail');
    this.mobileInput       = page.locator('#userNumber');
    this.dobInput          = page.locator('#dateOfBirthInput');
    this.subjectsInput     = page.locator('#subjectsInput');
    //this.hobbiesCheckboxes = page.locator('hobbiesWrapper');
    //this.pictureInput      = page.locator('#uploadPicture');
    this.addressInput      = page.locator('#currentAddress');
    this.stateDropdown     = page.locator('#state');
    this.cityDropdown      = page.locator('#city');
    this.submitButton      = page.locator('#submit');

    // Modal
    this.modal             = page.locator('.modal-content');
    this.modalTitle        = page.locator('#example-modal-sizes-title-lg');
    this.modalCloseButton  = page.locator('#closeLargeModal');
    this.modalTable        = page.locator('.table-responsive');
  }

  // Navigation 
  async goto() {
    await this.page.goto('https://demoqa.com/automation-practice-form');
    await this.page.evaluate(() => {
      document.querySelectorAll(
        'iframe, #fixedban, [id*="google_ads"], .widget-content, #Ad, footer'
      ).forEach(el => el.remove());
    });
  }

  // Fill Methods 
  async fillFirstName(value) {
    await this.firstNameInput.fill(value);
  }

  async fillLastName(value) {
    await this.lastNameInput.fill(value);
  }

  async fillEmail(value) {
    await this.emailInput.fill(value);
  }

  async fillMobile(value) {
    await this.mobileInput.click();
    await this.mobileInput.clear();
    await this.mobileInput.pressSequentially(String(value), { delay: 30 });
  }

  async selectGender(gender) {
    await this.page.evaluate((genderValue) => {
      const input = document.querySelector(`input[name="gender"][value="${genderValue}"]`);
      if (input) input.click();
    }, gender);
  }

  async fillDateOfBirth(day, month, year) {
    await this.dobInput.click();

    // เลือกปี
    await this.page.selectOption('.react-datepicker__year-select', year);
    // เลือกเดือน
    await this.page.selectOption('.react-datepicker__month-select', month);
    // เลือกวัน
    await this.page.locator(
      `.react-datepicker__day--0${day.padStart(2,'0')}:not(.react-datepicker__day--outside-month)`
    ).first().click();
  }

  async addSubject(subject) {
    await this.subjectsInput.fill(subject);
    await this.page.waitForSelector('.subjects-auto-complete__option', { timeout: 3000 });
    await this.page.locator('.subjects-auto-complete__option').first().click();
  }

  async selectHobby(hobby) {
    const indexMap = { Sports: 1, Reading: 2, Music: 3 };
    await this.page.evaluate((idx) => {
      const input = document.querySelector(`input#hobbies-checkbox-${idx}`);
      if (input) input.click();
    }, indexMap[hobby]);
  }

  async fillAddress(value) {
    await this.addressInput.fill(value);
  }

  async selectState(state) {
    await this.stateDropdown.click();
    await this.page.locator(`[id^="react-select"][id*="option"]:has-text("${state}")`).first().click();
  }

  async selectCity(city) {
    await this.cityDropdown.click();
    await this.page.locator(`[id^="react-select"][id*="option"]:has-text("${city}")`).first().click();
  }

  async uploadPicture(filePath) {
    await this.page.locator('#uploadPicture').setInputFiles(filePath);
  }

  // Submit & Modal 
  async submit() {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.page.evaluate(() => {
      document.querySelectorAll('iframe, #fixedban, [id*="google_ads"], footer').forEach(el => el.remove());
    });
    await this.submitButton.click({ force: true });
  }

  async isModalVisible() {
    return await this.modal.isVisible();
  }

  async getModalTitle() {
    return await this.modalTitle.textContent();
  }

  async getModalValue(label) {
    const row = this.page.locator(`.table-responsive tr:has(td:text-is("${label}"))`);
    return await row.locator('td').nth(1).textContent();
  }

  async closeModal() {
    await this.page.keyboard.press('Escape');
    
    await this.page.locator('.modal-content').waitFor({ 
      state: 'hidden', 
      timeout: 5000 
    });

    /*await this.page.evaluate(() => {
      document.querySelectorAll('iframe, #fixedban, [id*="google_ads"], footer').forEach(el => el.remove());
    });
    await this.modalCloseButton.scrollIntoViewIfNeeded();
    await this.modalCloseButton.click({ force: true });
    await this.page.waitForFunction(() => {
      const modal = document.querySelector('.modal-content');
      return !modal || modal.offsetParent === null;
    }, { timeout: 10000 });
      */

    // ไม่รู้ทำไม ลอง manual close แล้ว modal ยังไม่หายไปเลยต้องใช้วิธีนี้แทน
  }

  // Validation Helpers
  async isMobileInvalid() {
    return await this.mobileInput.evaluate(el =>
      el.classList.contains('field-error') || el.classList.contains('is-invalid')
    );
  }

  async isFieldHighlightedRed(locator) {
    return await locator.evaluate(el => {
      if (el.classList.contains('field-error') || el.classList.contains('is-invalid')) return true;
      let node = el.parentElement;
      for (let i = 0; i < 4; i++) {
        if (!node) break;
        if (node.classList.contains('field-error')) return true;
        node = node.parentElement;
      }
      const computed = window.getComputedStyle(el);
      const border = computed.borderColor;
      if (border.startsWith('rgb(220') || border.startsWith('rgb(255, 0')) return true;
      const bg = computed.backgroundColor;
      if (bg.startsWith('rgb(248') || bg.startsWith('rgb(255, 20')) return true;
      return false;
    });
  }

  async debugFieldState(locator) {
    return await locator.evaluate(el => {
      const computed = window.getComputedStyle(el);
      let parentClasses = [];
      let node = el.parentElement;
      for (let i = 0; i < 4; i++) {
        if (!node) break;
        parentClasses.push(`[${i}]: ${node.className}`);
        node = node.parentElement;
      }
      return {
        ownClasses: el.className,
        borderColor: computed.borderColor,
        backgroundColor: computed.backgroundColor,
        outline: computed.outline,
        parentClasses,
      };
    });
  }

  async isCityDropdownDisabled() {
    const cityInput = this.page.locator('#city input');
    return await cityInput.isDisabled().catch(() => true);
  }

  async getCityOptions() {
    await this.cityDropdown.click();
    await this.page.waitForSelector('[id^="react-select"][id*="option"]', { timeout: 3000 });
    const options = await this.page.locator('[id^="react-select"][id*="option"]').allTextContents();
    await this.page.keyboard.press('Escape');
    return options;
  }

  // All Valid Data 
  async fillAllValidData(data) {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    await this.fillEmail(data.email);
    await this.selectGender(data.gender);
    await this.fillMobile(data.mobile);
    await this.fillDateOfBirth(data.dateOfBirth.day, data.dateOfBirth.month, data.dateOfBirth.year);
    for (const subject of data.subjects) {
      await this.addSubject(subject);
    }
    for (const hobby of data.hobbies) {
      await this.selectHobby(hobby);
    }
    await this.uploadPicture(data.picturePath);
    await this.fillAddress(data.address);
    await this.selectState(data.state);
    await this.selectCity(data.city);
  }
}

module.exports = { RegistrationPage };