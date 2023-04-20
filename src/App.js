import React, { useState } from 'react';

import Form from './Components/Form.js';
import { Analytics } from '@vercel/analytics/react';
import './App.css';

function App() {
  const [disabled, setDisabled] = useState(false);

  const handleFormState = (formState) => {
    setDisabled(formState);
  };

  return (
    <div className="max-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-6">Noundation Capture Tool</h1>
        <Form handleFormState={handleFormState}/>
        {disabled && <div>disabled</div>}
      </div>
      <Analytics />
    </div>
  );
}
    
export default App;
