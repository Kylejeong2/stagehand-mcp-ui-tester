const componentCode = `
import React, { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className={\`btn \${isHovered ? 'hover' : ''} \${isPressed ? 'pressed' : ''}\`}
      onClick={() => {
        setIsPressed(true);
        onClick?.();
        setTimeout(() => setIsPressed(false), 200);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-pressed={isPressed}
    >
      {label}
    </button>
  );
};
`;

async function testComponent() {
  const request = {
    id: "1",
    method: "test_component",
    params: {
      componentCode,
      componentName: "Button",
      testUrl: "http://localhost:3000/test/button",
      testInstructions: `
        Additional test cases:
        1. Verify hover state changes background color
        2. Verify pressed state adds shadow effect
        3. Check that aria-pressed attribute updates correctly
        4. Ensure onClick handler is called
      `
    }
  };

  // Send to MCP tool
  const response = await fetch('http://localhost:8000/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  const result = await response.json();
  console.log('Test Results:', result);

  if (result.error) {
    console.error('Test failed:', result.error.message);
    return;
  }

  console.log('Generated Test Code:');
  console.log(result.result.testCode);
  
  console.log('Test Execution Results:');
  console.log(result.result.testResults);
  
  // Save screenshot
  const screenshotBuffer = Buffer.from(result.result.screenshot, 'base64');
  const fs = require('fs');
  fs.writeFileSync('test-screenshot.png', screenshotBuffer);
  console.log('Screenshot saved as test-screenshot.png');
}

testComponent().catch(console.error); 