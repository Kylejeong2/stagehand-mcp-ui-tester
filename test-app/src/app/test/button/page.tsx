import { Button } from '@/components/Button';

export default function ButtonTestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold mb-8">Button Component Test</h1>
      
      <div className="flex flex-col gap-4">
        <Button 
          label="Primary Button" 
          onClick={() => console.log('Primary clicked')}
        />
        
        <Button 
          label="Secondary Button" 
          variant="secondary"
          onClick={() => console.log('Secondary clicked')}
        />
      </div>
    </div>
  )
} 