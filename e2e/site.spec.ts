import { test, expect } from '@playwright/test';

test.describe('root redirect', () => {
  test('/ redirects to the Spanish home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es\/$/);
    await expect(page).toHaveTitle(/Del Huerto a tu casa/);
  });
});

test.describe('Spanish site', () => {
  test('home page loads with key content', async ({ page }) => {
    await page.goto('/es/');
    await expect(page).toHaveTitle('Organiko - Del Huerto a tu casa');
    await expect(page.locator('.main-header')).toBeVisible();
    await expect(page.locator('#slider')).toBeAttached();
    await expect(page.getByRole('link', { name: 'Hacer un pedido' })).toBeVisible();
    await expect(page.getByText('organiko@organiko.es')).toBeVisible();
  });

  test('navigates to the order page', async ({ page }) => {
    await page.goto('/es/');
    await page.getByRole('link', { name: 'Hacer un pedido' }).click();
    await expect(page).toHaveURL(/\/es\/order/);
    await expect(page.getByRole('heading', { name: 'Hacer un pedido' })).toBeVisible();
    await expect(page.locator('iframe.order-iframe')).toBeVisible();
  });
});

test.describe('English site', () => {
  test('home page loads with key content', async ({ page }) => {
    await page.goto('/en/');
    await expect(page).toHaveTitle('Organiko - From the garden to your home');
    await expect(page.locator('.main-header')).toBeVisible();
    await expect(page.locator('#slider')).toBeAttached();
    await expect(page.getByRole('link', { name: 'Order products' })).toBeVisible();
    await expect(page.getByText('organiko@organiko.es')).toBeVisible();
  });

  test('navigates to the order page', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: 'Order products' }).click();
    await expect(page).toHaveURL(/\/en\/order/);
    await expect(page.getByRole('heading', { name: 'Order products' })).toBeVisible();
    await expect(page.locator('iframe.order-iframe')).toBeVisible();
  });
});

test.describe('language switcher', () => {
  test('switches from Spanish to English', async ({ page }) => {
    await page.goto('/es/');
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page).toHaveTitle(/From the garden to your home/);
  });

  test('switches from English to Spanish', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: 'Castellano' }).click();
    await expect(page).toHaveURL(/\/es\/$/);
    await expect(page).toHaveTitle(/Del Huerto a tu casa/);
  });
});

test.describe('static assets', () => {
  test('stylesheet loads and applies brand colors', async ({ page }) => {
    await page.goto('/es/');
    const menuColor = await page.locator('.menu').evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    // #0B6D3C -> rgb(11, 109, 60)
    expect(menuColor).toBe('rgb(11, 109, 60)');
  });

  test('header image loads successfully', async ({ page }) => {
    await page.goto('/es/');
    const img = page.locator('img.main-header');
    await expect(img).toBeVisible();
    const naturalWidth = await img.evaluate(
      (el: HTMLImageElement) => el.naturalWidth
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });
});

test.describe('image carousel', () => {
  const activeSrc = (page) =>
    page.locator('#slider img.active').getAttribute('src');

  test('renders one nav dot per slide', async ({ page }) => {
    await page.goto('/es/');
    const slides = await page.locator('#slider img').count();
    expect(slides).toBe(7);
    await expect(page.locator('.slider-dots button')).toHaveCount(slides);
  });

  test('auto-advances to the next slide', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.locator('#slider img.active')).toHaveCount(1);
    const first = await activeSrc(page);
    // Auto-advance interval is 4s; wait for the active slide to change.
    await expect
      .poll(() => activeSrc(page), { timeout: 8000 })
      .not.toBe(first);
  });

  test('clicking a nav dot jumps to that slide', async ({ page }) => {
    await page.goto('/es/');
    await page.locator('.slider-dots button').nth(4).click();
    await expect(page.locator('#slider img').nth(4)).toHaveClass(/active/);
    expect(await activeSrc(page)).toContain('slider-5');
    await expect(page.locator('.slider-dots button').nth(4)).toHaveClass(
      /active/
    );
  });

  test('the active slide image actually loads', async ({ page }) => {
    await page.goto('/es/');
    const nw = await page
      .locator('#slider img.active')
      .evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(nw).toBeGreaterThan(0);
  });
});
