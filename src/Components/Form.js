import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function Form(props){
  const [formState, setFormDisabled] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleFormChange = (formState) => {
    setFormDisabled(formState);
    props.handleFormState(formState);
  };

  const onSubmit = async (data) => {
    let datasetId;
    let responseItems;
    let gifOutput;

    try {
      const response = await axios.post('https://api.apify.com/v2/acts/glenn~gif-scroll-animation/runs?token=' + process.env.REACT_APP_APIFY_API_KEY, {
        "url": String(data.url),
        "proxyOptions": {
            "useApifyProxy": true
        },
        "frameRate": parseInt(data.frameRate),
        "scrollDown": true,
        "scrollPercentage": 10,
        "recordingTimeBeforeAction": 200,
        "waitToLoadPage": 6000,
        // "cookieWindowSelector": ".cookieConsent button",
        "slowDownAnimations": true,
        "lossyCompression": true,
        "loslessCompression": false,
        // "viewportWidth": parseInt(data.viewportWidth),
        // "viewportHeight": parseInt(data.viewportHeight),
        "viewportWidth": 640,
        "viewportHeight": 360,
      });
      const { data: { data: { defaultDatasetId } } } = response;
      datasetId = defaultDatasetId;
    } catch (error) {
      console.error(error);
    }

    try {
      responseItems = await axios.get('https://api.apify.com/v2/datasets/' + datasetId + '/items');
      while (typeof responseItems.data === 'undefined' || responseItems.data.length === 0) {
        try {
          responseItems = await axios.get('https://api.apify.com/v2/datasets/' + datasetId + '/items');
          if (responseItems.data.length !== 0) {
            gifOutput = responseItems.data[0].gifUrlOriginal;
            handleFormChange(false);
          } else {
            handleFormChange(true);
          }
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }

    try {
      await axios.post('https://api.airtable.com/v0/' + process.env.REACT_APP_AIRTABLE_BASE_ID + '/Captures', {
        fields: {
          "URL": String(data.url),
          "GIF URL": gifOutput,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      alert('GIF animation created and saved to Airtable!');
    } catch (error) {
      console.error(error);
    }    
  }

  return (
    <div className="w-full max-w-xs">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
            Website URL
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="URL" id="url" {...register('url', { required: true })} disabled={formState} />
          {errors.url && <p className="text-red-500 text-xs italic">This field is required.</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="frameRate">
            Frame Rate (in ms)
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="7" id="frameRate" {...register('frameRate', { required: true })} disabled={formState}/>
          {errors.scrollDuration && <p className="text-red-500 text-xs italic">This field is required.</p>}
        </div>
        {/* <label htmlFor="viewportWidth">Screenshot width (in px)</label>
        <input type="number" id="viewportWidth" {...register('viewportWidth', { required: true })} disabled={isDisabled}/>
        {errors.viewportWidth && <span>This field is required</span>}
        <label htmlFor="viewportHeight">Screenshot Height (in px)</label>
        <input type="number" id="viewportHeight" {...register('viewportHeight', { required: true })} disabled={isDisabled} />
        {errors.viewportHeight && <span>This field is required</span>} */}
        <div className="flex items-center justify-between">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Create GIF
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
