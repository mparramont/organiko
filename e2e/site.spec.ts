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
    await expect(page).toHaveTitle('Organiko — Del Huerto a tu casa');
    await expect(page.locator('.main-header')).toBeVisible();
    await expect(page.locator('#slider')).toBeAttached();
    await expect(page.getByRole('link', { name: 'Hacer un pedido' })).toBeVisible();
    await expect(page.getByText('organiko@organiko.es')).not.toBeAttached();
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
    await expect(page).toHaveTitle('Organiko — From the garden to your home');
    await expect(page.locator('.main-header')).toBeVisible();
    await expect(page.locator('#slider')).toBeAttached();
    await expect(page.getByRole('link', { name: 'Order products' })).toBeVisible();
    await expect(page.getByText('organiko@organiko.es')).not.toBeAttached();
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

test.describe('share metadata (OG + Twitter Card)', () => {
  const cases = [
    { path: '/en/', title: 'From the garden to your home', locale: 'en_GB' },
    { path: '/es/', title: 'Del Huerto a tu casa',         locale: 'es_ES' },
    { path: '/en/order', title: 'Order products',          locale: 'en_GB' },
    { path: '/es/order', title: 'Hacer un pedido',         locale: 'es_ES' },
  ];

  for (const { path, title, locale } of cases) {
    test(`${path} has correct OG and Twitter tags`, async ({ page }) => {
      await page.goto(path);
      const og = (prop: string) =>
        page.locator(`meta[property="${prop}"]`).getAttribute('content');
      const tw = (name: string) =>
        page.locator(`meta[name="${name}"]`).getAttribute('content');

      expect(await og('og:title')).toContain(title);
      expect(await og('og:site_name')).toBe('Organiko');
      expect(await og('og:type')).toBe('website');
      expect(await og('og:url')).toContain(path.replace(/\/$/, ''));
      expect(await og('og:locale')).toBe(locale);

      const imgUrl = await og('og:image');
      expect(imgUrl).toMatch(/^https:\/\//);
      expect(imgUrl).toContain('slider-2.jpg');
      // og:image must return 200
      const resp = await page.request.get(imgUrl!);
      expect(resp.status()).toBe(200);

      expect(await tw('twitter:card')).toBe('summary_large_image');
      expect(await tw('twitter:title')).toContain(title);
      expect(await tw('twitter:image')).toBe(imgUrl);
    });
  }
});

test.describe('contact redaction', () => {
  const pages = ['/es/', '/en/', '/es/order', '/en/order'];

  for (const path of pages) {
    test(`${path} has no email or phone`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText('organiko@organiko.es')).not.toBeAttached();
      await expect(page.getByText('654 093 919')).not.toBeAttached();
      await expect(page.getByText('Carlos Parramón')).not.toBeAttached();
    });
  }
});

test.describe('static assets', () => {
  test('favicon is declared on every page', async ({ page }) => {
    for (const path of ['/es/', '/en/', '/es/order', '/en/order']) {
      await page.goto(path);
      const href = await page.evaluate(
        () => document.querySelector('link[rel="icon"]')?.getAttribute('href')
      );
      expect(href, `${path} missing favicon`).toMatch(/favicon/);
      // favicon file actually returns 200
      const abs = new URL(href!, page.url()).href;
      const resp = await page.request.get(abs);
      expect(resp.status(), `${path} favicon 404`).toBe(200);
    }
  });
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
