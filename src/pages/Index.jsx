import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import ReactMarkdown from 'react-markdown'
import { Loader2, X } from "lucide-react"

const Index = () => {
  const [formData, setFormData] = useState({
    news: '',
    personal: '',
    controversial: '',
    inspiring: '',
  });
  const [draft, setDraft] = useState('');
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [imageUploaded, setImageUploaded] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;
        setImage(imageData);
        setImageUploaded(true);
        
        // Trigger webhook with image data
        await makeWebhookCall({
          upload_image: true,
          image: imageData,
          file_name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [consoleData, setConsoleData] = useState(null);
  const [showConsole, setShowConsole] = useState(false);

  const makeWebhookCall = async (action = 'generate') => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        action,
        draft,
        image: image || null,
        file_name: fileName || null,
        image_url: data?.result_image || null,
      };
      setImageUploaded(false); // Reset the flag after sending the request

      setConsoleData({ request: payload });
      setShowConsole(true);

      const response = await axios.put('https://hook.eu1.make.com/7hok9kqjre31fea5p7yi9ialusmbvlkc', payload);
      
      // Process the response immediately
      if (response.status === 200 && response.data) {
        setData(response.data);
        setConsoleData(prevData => ({ ...prevData, response: response.data }));
        if (response.data?.is_news && response.data?.result_text) {
          setFormData(prevData => ({ ...prevData, news: response.data.result_text }));
        }
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing the request');
      setConsoleData(prevData => ({ ...prevData, error: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (action = 'generate') => {
    makeWebhookCall(action);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Generation App</h1>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Textarea
            name="news"
            value={formData.news}
            onChange={handleInputChange}
            placeholder="Enter news..."
            className="flex-grow"
            rows={3}
          />
          <Button onClick={() => handleSubmit('get_news')} className="h-24">
            Get News
          </Button>
        </div>
        <Input
          name="personal"
          value={formData.personal}
          onChange={handleInputChange}
          placeholder="Personal"
        />
        <Input
          name="controversial"
          value={formData.controversial}
          onChange={handleInputChange}
          placeholder="Controversial"
        />
        <Input
          name="inspiring"
          value={formData.inspiring}
          onChange={handleInputChange}
          placeholder="Inspiring"
        />
        <Button onClick={() => handleSubmit('generate')} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <p>Processing request, please wait...</p>
        </div>
      )}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}

      {data && !data.is_news && data.result_text && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Generated Content:</h2>
          {data.result_image && (
            <div className="mb-4">
              <img src={data.result_image} alt="Generated" className="max-w-full h-auto" />
            </div>
          )}
          <div className="bg-gray-100 p-4 rounded-md">
            <ReactMarkdown>{data.result_text}</ReactMarkdown>
          </div>
          <div className="mt-4 space-x-2">
            <Button onClick={() => handleSubmit('re-generate')}>Re-generate</Button>
            <Button onClick={() => handleSubmit('post_linkedin')}>Post on LinkedIn</Button>
            <Button onClick={() => handleSubmit('generate_image')}>Generate Image</Button>
            <Button onClick={() => document.getElementById('imageUpload').click()}>Upload Image</Button>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      )}
      {showConsole && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 max-h-64 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Webhook Console</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowConsole(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <pre className="text-sm">{JSON.stringify(consoleData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Index;
