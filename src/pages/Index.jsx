import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import ReactMarkdown from 'react-markdown'
import { Loader2 } from "lucide-react"

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

  const makeWebhookCall = async (additionalData = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        get_news: additionalData.get_news || false,
        generate_image: additionalData.generate_image || false,
        're-generate': additionalData['re-generate'] || false,
        post_linkedin: additionalData.post_linkedin || false,
        draft,
        image,
        file_name: fileName,
        upload_image: imageUploaded,
        image_url: data?.result_image || '',
        generate: !Object.values(additionalData).some(Boolean),
      };
      setImageUploaded(false); // Reset the flag after sending the request

      const response = await axios.put('https://hook.eu1.make.com/7hok9kqjre31fea5p7yi9ialusmbvlkc', payload);
      
      // Start polling for results
      let pollCount = 0;
      const pollInterval = setInterval(async () => {
        pollCount++;
        if (pollCount >= 10) { // Poll for up to 30 seconds (10 * 3s)
          clearInterval(pollInterval);
          setError("Timeout: No response received after 30 seconds");
          setIsLoading(false);
          return;
        }
        
        try {
          const pollResponse = await axios.get(`https://hook.eu1.make.com/7hok9kqjre31fea5p7yi9ialusmbvlkc?id=${response.data.id}`);
          if (pollResponse.data.status === 'completed') {
            clearInterval(pollInterval);
            setData(pollResponse.data);
            if (pollResponse.data?.is_news && pollResponse.data?.result_text) {
              setFormData(prevData => ({ ...prevData, news: pollResponse.data.result_text }));
            }
            setIsLoading(false);
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 3000); // Poll every 3 seconds
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSubmit = (additionalData = {}) => {
    makeWebhookCall(additionalData);
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
          <Button onClick={() => handleSubmit({ get_news: true })} className="h-24">
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
        <Button onClick={() => handleSubmit()} disabled={isLoading}>
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
            <Button onClick={() => handleSubmit({ 're-generate': true })}>Re-generate</Button>
            <Button onClick={() => handleSubmit({ post_linkedin: true })}>Post on LinkedIn</Button>
            <Button onClick={() => handleSubmit({ generate_image: true })}>Generate Image</Button>
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
