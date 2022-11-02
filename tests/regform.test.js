const webdriver = require('selenium-webdriver');
const { until } = require('selenium-webdriver');
const { By } = require('selenium-webdriver');
const LambdaTestRestClient = require('@lambdatest/node-rest-client');
const assert = require('assert');

const username = process.env.LT_USERNAME || 'Username';
const accessKey = process.env.LT_ACCESS_KEY || 'Access Key';

const AutomationClient = LambdaTestRestClient.AutomationClient({
  username,
  accessKey
});
const capabilities = {
  "browserName": "Chrome",
	"browserVersion": "105.0",
	"LT:Options": {
		"username": "Username",
		"accessKey": "Access Key",
		"platformName": "Windows 10",
		"project": "Unit Testing",
		"selenium_version": "4.0.0",
		"w3c": true
	}
};

const getElementById = async (driver, id, timeout = 8000) => {
    const el = await driver.wait(until.elementLocated(By.id(id)), timeout);
    return await driver.wait(until.elementIsVisible(el), timeout);
};

const getElementByName = async (driver, name, timeout = 8000) => {
  const el = await driver.wait(until.elementLocated(By.name(name)), timeout);
  return await driver.wait(until.elementIsVisible(el), timeout);
};

const getElementByXpath = async (driver, xpath, timeout = 10000) => {
  const el = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  return await driver.wait(until.elementIsVisible(el), timeout);
};

let sessionId = null;

describe('webdriver', () => {
  let driver;
  beforeAll(async () => {
    driver = new webdriver.Builder()
      .usingServer(
        'https://' + username + ':' + accessKey + '@hub.lambdatest.com/wd/hub'
      )
      .withCapabilities(capabilities)
      .build();
    await driver.getSession().then(function(session) {
      sessionId = session.id_;
    });
    // eslint-disable-next-line no-undef
    await driver.get(`https://ecommerce-playground.lambdatest.io/index.php?route=account/register`);
  }, 50000);

  afterAll(async () => {
    await driver.quit();
  }, 40000);

  

  test('Test "Submit" without all fields being filled', async () => {

    try {
      const send = await getElementByXpath(driver, '//input[@value="Continue"]');
      await send.click()

      const FirstNameErrorMessage = await getElementByXpath(driver, '//div[contains(text(),"First Name must be between 1 and 32 characters!")]');
      FirstNameErrorMessage.getText().then(function(value) {
        expect(value).toBe('First Name must be between 1 and 32 characters!');
      });

      const LastNameErrorMessage = await getElementByXpath(driver, '//div[contains(text(),"Last Name must be between 1 and 32 characters!")]');
      LastNameErrorMessage.getText().then(function(value) {
        expect(value).toBe('Last Name must be between 1 and 32 characters!');
      });

      const EmailErrorMessage = await getElementByXpath(driver, '//div[contains(text(),"E-Mail Address does not appear to be valid!")]');
      EmailErrorMessage.getText().then(function(value) {
        expect(value).toBe('E-Mail Address does not appear to be valid!');
      });

      const TelephoneErrorMessage = await getElementByXpath(driver, '//div[normalize-space()="Telephone must be between 3 and 32 characters!"]');
      TelephoneErrorMessage.getText().then(function(value) {
        expect(value).toBe('Telephone must be between 3 and 32 characters!');
      });

      const PasswordErrorMessage = await getElementByXpath(driver, '//div[contains(text(),"Password must be between 4 and 20 characters!")]');
      PasswordErrorMessage.getText().then(function(value) {
        expect(value).toBe('Password must be between 4 and 20 characters!');
      });

      const PrivacyPolicyErrorMessage = await getElementByXpath(driver, '//div[@class="alert alert-danger alert-dismissible"]');
      PrivacyPolicyErrorMessage.getText().then(function(value) {
        expect(value).toBe('Warning: You must agree to the Privacy Policy!');
      });

      await updateJob(sessionId, 'passed');
    } catch (err) {
      await updateJob(sessionId, 'failed');
      await webdriverErrorHandler(err, driver);
      throw err;
    }
  }, 100000);

  test('Test Invalid Email address submission', async () => {

    try {
      const firstName = await getElementById(driver, 'input-firstname');
      await firstName.clear();
      await firstName.sendKeys("James");
      
      const lastName = await getElementById(driver, 'input-lastname');
      await lastName.clear();
      await lastName.sendKeys("Doe");

      const Email = await getElementById(driver, 'input-email');
      await Email.clear();
      await Email.sendKeys("john@gmail");

      const Telephone = await getElementById(driver, 'input-telephone');
      await Telephone.clear();
      await Telephone.sendKeys("0712345678");

      const Password = await getElementById(driver, 'input-password');
      await Password.clear();
      await Password.sendKeys("12345");

      const confirmPassword = await getElementById(driver, 'input-confirm');
      await confirmPassword.clear();
      await confirmPassword.sendKeys("12345");

      const AgreePolicy = await getElementByXpath(driver, '//label[@for="input-agree"]');
      await AgreePolicy.click()

      const submit = await getElementByXpath(driver, '//input[@value="Continue"]');
      await submit.click()

      const EmailErrorMessage = await getElementByXpath(driver, '//div[@class="text-danger"]');
      EmailErrorMessage.getText().then(function(value) {
        expect(value).toBe('E-Mail Address does not appear to be valid!');
      });

      await updateJob(sessionId, 'passed');
    } catch (err) {
      await updateJob(sessionId, 'failed');
      await webdriverErrorHandler(err, driver);
      throw err;
    }
  }, 100000);

  test('Test Account Created Success Message', async () => {

    try {
      const firstName = await getElementById(driver, 'input-firstname');
      await firstName.clear();
      await firstName.sendKeys("James");
      
      const lastName = await getElementById(driver, 'input-lastname');
      await lastName.clear();
      await lastName.sendKeys("Doe");

      const Email = await getElementById(driver, 'input-email');
      await Email.clear();
      await Email.sendKeys("jdoe@example.com");

      const Telephone = await getElementById(driver, 'input-telephone');
      await Telephone.clear();
      await Telephone.sendKeys("0712345678");

      const Password = await getElementById(driver, 'input-password');
      await Password.clear();
      await Password.sendKeys("12345");

      const confirmPassword = await getElementById(driver, 'input-confirm');
      await confirmPassword.clear();
      await confirmPassword.sendKeys("12345");

      const submit = await getElementByXpath(driver, '//input[@value="Continue"]');
      await submit.click()

      const SuccessMessage = await getElementByXpath(driver, '//h1[@class="page-title my-3"]');
      SuccessMessage.getText().then(function(value) {
        expect(value).toBe('Your Account Has Been Created!');
      });

      await updateJob(sessionId, 'passed');
    } catch (err) {
      await updateJob(sessionId, 'failed');
      await webdriverErrorHandler(err, driver);
      throw err;
    }
  }, 100000);
});

async function webdriverErrorHandler(err, driver) {
  console.error('Unhandled exception! ' + err.message);
  if (driver && sessionId) {
    try {
      await driver.quit();
    } catch (_) {}
    await updateJob(sessionId, 'failed');
  }
}
function updateJob(sessionId, status) {
  return new Promise((resolve, reject) => {
    AutomationClient.updateSessionById(
      sessionId,
      { status_ind: status },
      err => {
        if (err) return reject(err);
        return resolve();
      }
    );
  });
}