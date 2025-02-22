import { test, expect } from '@playwright/test';

// Example of testing a button component
test('button component test', async ({ page }) => {
  // Navigate to the component's test page
  await page.goto('http://localhost:3000/test/button');
  
  // Basic interaction tests
  await test.step('should render button with correct text', async () => {
    const button = page.getByRole('button', { name: 'Click me' });
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Click me');
  });

  await test.step('should change state on hover', async () => {
    const button = page.getByRole('button', { name: 'Click me' });
    await button.hover();
    // Check if hover state is applied (e.g., background color change)
    await expect(button).toHaveCSS('background-color', 'rgb(59, 130, 246)');
  });

  await test.step('should handle click events', async () => {
    const button = page.getByRole('button', { name: 'Click me' });
    await button.click();
    // Check if click state is handled (e.g., counter increment)
    const counter = page.getByTestId('click-counter');
    await expect(counter).toHaveText('Clicks: 1');
  });

  await test.step('should be accessible', async () => {
    // Check for ARIA attributes
    const button = page.getByRole('button', { name: 'Click me' });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  });
}); 