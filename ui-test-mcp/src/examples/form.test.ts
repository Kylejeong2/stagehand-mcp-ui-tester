import { test, expect } from '@playwright/test';

test('form component test', async ({ page }) => {
  await page.goto('http://localhost:3000/test/form');

  await test.step('should validate required fields', async () => {
    // Try submitting empty form
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await submitButton.click();

    // Check error messages
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  await test.step('should validate email format', async () => {
    const emailInput = page.getByLabel('Email');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    await expect(page.getByText('Please enter a valid email')).toBeVisible();
    
    // Fix the email
    await emailInput.fill('test@example.com');
    await emailInput.blur();
    await expect(page.getByText('Please enter a valid email')).not.toBeVisible();
  });

  await test.step('should validate password requirements', async () => {
    const passwordInput = page.getByLabel('Password');
    
    // Test minimum length
    await passwordInput.fill('short');
    await passwordInput.blur();
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    
    // Test password strength
    await passwordInput.fill('password123');
    await passwordInput.blur();
    await expect(page.getByText('Password must contain at least one uppercase letter')).toBeVisible();
    
    // Valid password
    await passwordInput.fill('StrongPass123!');
    await passwordInput.blur();
    await expect(page.getByText(/Password must/)).not.toBeVisible();
  });

  await test.step('should handle form submission', async () => {
    // Fill form with valid data
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('StrongPass123!');
    
    // Mock API call
    await page.route('**/api/register', async route => {
      await route.fulfill({ 
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });
    
    // Submit form
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Check success message
    await expect(page.getByText('Registration successful!')).toBeVisible();
  });

  await test.step('should handle API errors', async () => {
    // Mock API error
    await page.route('**/api/register', async route => {
      await route.fulfill({ 
        status: 400,
        body: JSON.stringify({ 
          error: 'Email already exists' 
        })
      });
    });
    
    // Submit form
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Check error message
    await expect(page.getByText('Email already exists')).toBeVisible();
  });
}); 