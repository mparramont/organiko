import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC = join(import.meta.dirname, '..', 'public');

function readHtml(relPath) {
  const fullPath = join(PUBLIC, relPath);
  assert.ok(existsSync(fullPath), `File not found: ${relPath}`);
  return readFileSync(fullPath, 'utf8');
}

test('en/index.html exists and has key content', () => {
  const html = readHtml('en/index.html');
  assert.match(html, /Organiko/, 'missing brand name');
  assert.match(html, /From the garden to your home/, 'missing page title');
  assert.match(html, /Order products/, 'missing nav link');
  assert.match(html, /slider/, 'missing image slider');
  assert.match(html, /organiko@organiko\.es/, 'missing contact email');
  assert.match(html, /all\.css/, 'missing stylesheet link');
});

test('en/order.html exists and has key content', () => {
  const html = readHtml('en/order.html');
  assert.match(html, /Order products/, 'missing page title');
  assert.match(html, /docs\.google\.com/, 'missing order form iframe');
  assert.match(html, /organiko@organiko\.es/, 'missing contact email');
});

test('es/index.html exists and has key content', () => {
  const html = readHtml('es/index.html');
  assert.match(html, /Organiko/, 'missing brand name');
  assert.match(html, /Del Huerto a tu casa/, 'missing page title');
  assert.match(html, /Hacer un pedido/, 'missing nav link');
  assert.match(html, /slider/, 'missing image slider');
  assert.match(html, /organiko@organiko\.es/, 'missing contact email');
});

test('es/order.html exists and has key content', () => {
  const html = readHtml('es/order.html');
  assert.match(html, /Hacer un pedido/, 'missing page title');
  assert.match(html, /docs\.google\.com/, 'missing order form iframe');
  assert.match(html, /organiko@organiko\.es/, 'missing contact email');
});

test('stylesheet exists', () => {
  assert.ok(existsSync(join(PUBLIC, 'stylesheets/all.css')), 'missing all.css');
  const css = readFileSync(join(PUBLIC, 'stylesheets/all.css'), 'utf8');
  assert.match(css, /#9C3210/, 'missing brand dark-brown color');
  assert.match(css, /#0B6D3C/, 'missing brand dark-green color');
});

test('image slider JS exists', () => {
  assert.ok(existsSync(join(PUBLIC, 'javascripts/js-image-slider.js')), 'missing slider JS');
});

test('images exist', () => {
  const images = ['header.jpg', 'slider-1.jpg', 'slider-7.jpg', 'bullet.png', 'loading.gif'];
  for (const img of images) {
    assert.ok(existsSync(join(PUBLIC, 'images', img)), `missing image: ${img}`);
  }
});

test('_redirects has root redirect', () => {
  const redirects = readHtml('_redirects');
  assert.match(redirects, /^\/ \/es\//m, 'missing root → /es/ redirect');
});

test('language switcher links present on all pages', () => {
  const pages = ['en/index.html', 'en/order.html', 'es/index.html', 'es/order.html'];
  for (const page of pages) {
    const html = readHtml(page);
    assert.match(html, /href="\.\.\/es\/"/, `${page}: missing /es/ link`);
    assert.match(html, /href="\.\.\/en\/"/, `${page}: missing /en/ link`);
  }
});
