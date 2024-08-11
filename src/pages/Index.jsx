import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import ReactMarkdown from 'react-markdown'
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);

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

      const response = await axios.put('https://hook.eu1.make.com/7hok9kqjre31fea5p7yi9ialusmbvlkc', payload);
      
      console.log("Raw webhook response:", response.data);
      
      if (response.status === 200 && response.data) {
        let parsedData;
        try {
          parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          
          // Additional sanitization
          if (Array.isArray(parsedData)) {
            parsedData = parsedData.map(item => ({
              ...item,
              result_text: item.result_text ? item.result_text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '') : ''
            }));
          } else if (typeof parsedData === 'object') {
            parsedData.result_text = parsedData.result_text ? parsedData.result_text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '') : '';
          }
        } catch (parseError) {
          console.error("Error parsing or sanitizing JSON:", parseError);
          setError("Unable to parse server response. Please try again.");
          setDialogContent({ error: "Server response parsing error. Please try again." });
          setDialogOpen(true);
          return;
        }
        
        setData(parsedData);
        
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const firstItem = parsedData[0];
          if (firstItem.is_news) {
            setFormData(prevData => ({ ...prevData, news: firstItem.result_text }));
          } else {
            setDraft(firstItem.result_text);
          }
        } else if (parsedData.result_text) {
          setDraft(parsedData.result_text);
        }
        
        if (parsedData.result_image) {
          setImage(parsedData.result_image);
        }
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing the request');
      setDialogContent({ error: err.message });
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (action = 'generate') => {
    makeWebhookCall(action);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen overflow-y-auto">
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

      {data && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Generated Content:</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              {image && (
                <div className="mb-4">
                  <img src={image} alt="Generated" className="max-w-full h-auto rounded-md" />
                </div>
              )}
              {draft && (
                <div className="bg-gray-100 p-4 rounded-md">
                  <ReactMarkdown>{draft}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {draft && (
        <div className="mt-8">
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => handleSubmit('re-generate')}>Re-generate</Button>
            <Button onClick={() => handleSubmit('post_linkedin')}>Post on LinkedIn</Button>
            <Button onClick={() => handleSubmit('generate_image')}>Generate Image</Button>
            <Button onClick={() => document.getElementById('imageUpload').click()}>Upload Image</Button>
            <Button onClick={() => handleSubmit('summarize')}>Summarize</Button>
            <Button onClick={() => handleSubmit('expand')}>Expand</Button>
            <Button onClick={() => handleSubmit('translate')}>Translate</Button>
            <Button onClick={() => handleSubmit('sentiment')}>Sentiment Analysis</Button>
            <Button onClick={() => handleSubmit('improve')}>Improve</Button>
            <Button onClick={() => handleSubmit('simplify')}>Simplify</Button>
            <Button onClick={() => handleSubmit('formalize')}>Formalize</Button>
            <Button onClick={() => handleSubmit('casual')}>Make Casual</Button>
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
    </div>
  );
};

export default Index;
