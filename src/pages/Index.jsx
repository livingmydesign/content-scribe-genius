import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown'
import { Loader2 } from "lucide-react"
import JSON5 from 'json5';
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

  useEffect(() => {
    const savedContent = sessionStorage.getItem('generatedContent');
    if (savedContent) {
      const parsedContent = JSON.parse(savedContent);
      setData(parsedContent);
      if (parsedContent.result_text) {
        setDraft(parsedContent.result_text);
      }
      if (parsedContent.result_image) {
        setImage(parsedContent.result_image);
      }
    }
  }, []);

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
    console.log(`Starting webhook call for action: ${action}`);
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
      console.log('Payload prepared:', payload);
      setImageUploaded(false); // Reset the flag after sending the request

      const response = await axios.put('https://hook.eu1.make.com/7hok9kqjre31fea5p7yi9ialusmbvlkc', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      
      console.log("Raw webhook response:", response.data);
      
      if (response.status === 200 && response.data) {
        let parsedData = response.data;
        
        // Check if the response is a string, if so, try to parse it
        if (typeof response.data === 'string') {
          try {
            parsedData = JSON.parse(response.data);
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            throw new Error('Failed to parse server response');
          }
        }
        
        // If parsedData is an array, take the first item
        if (Array.isArray(parsedData)) {
          parsedData = parsedData[0];
        }
        
        console.log('Parsed response data:', parsedData);
        
        // Function to sanitize text
        const sanitizeText = (text) => {
          if (typeof text !== 'string') return text;
          return text.replace(/\\n/g, '\n').replace(/\\/g, '');
        };
        
        // Extract and sanitize the result_text and is_news
        let sanitizedText, is_news;
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const firstItem = parsedData[0];
          sanitizedText = sanitizeText(firstItem.result_text);
          is_news = firstItem.is_news;
        } else if (typeof parsedData === 'object' && parsedData !== null) {
          sanitizedText = sanitizeText(parsedData.result_text);
          is_news = parsedData.is_news;
        } else {
          throw new Error('Unexpected response format from server');
        }
        
        if (sanitizedText === undefined || is_news === undefined) {
          throw new Error('Missing required data in server response');
        }
        
        setData({ result_text: sanitizedText, is_news });
        console.log('Extracted data:', { result_text: sanitizedText, is_news });
        
        if (is_news) {
          setFormData(prevData => ({ ...prevData, news: sanitizedText }));
        } else {
          setDraft(sanitizedText);
        }

        // Store the generated content in sessionStorage
        sessionStorage.setItem('generatedContent', JSON.stringify({ result_text: sanitizedText, is_news }));
        console.log('Content stored in sessionStorage');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error in makeWebhookCall:', err);
      let errorMessage;
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'No response received from the server. Please check your network connection.';
      } else {
        errorMessage = err.message || 'An unknown error occurred';
      }
      setError(errorMessage);
      setDialogContent({ error: errorMessage });
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
      console.log('Webhook call completed');
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
            id="news"
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
          id="personal"
          value={formData.personal}
          onChange={handleInputChange}
          placeholder="Personal"
        />
        <Input
          name="controversial"
          id="controversial"
          value={formData.controversial}
          onChange={handleInputChange}
          placeholder="Controversial"
        />
        <Input
          name="inspiring"
          id="inspiring"
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
              {!draft && data && data.result_text && (
                <div className="bg-gray-100 p-4 rounded-md">
                  <ReactMarkdown>{data.result_text}</ReactMarkdown>
                </div>
              )}
              {console.log('Draft:', draft)}
              {console.log('Data:', data)}
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
