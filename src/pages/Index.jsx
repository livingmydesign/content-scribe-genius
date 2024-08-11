import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import ReactMarkdown from 'react-markdown'

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const makeWebhookCall = async (additionalData = {}) => {
    const payload = {
      ...formData,
      get_news: additionalData.get_news || false,
      generate_image: additionalData.generate_image || false,
      're-generate': additionalData['re-generate'] || false,
      post_linkedin: additionalData.post_linkedin || false,
      draft,
      image,
      file_name: fileName,
    };

    const { data } = await axios.put('https://hook.eu1.make.com/7hok9kqjre31fea5p7yi9ialusmbvlkc', payload);
    return data;
  };

  const { data, refetch, isLoading, isError, error } = useQuery({
    queryKey: ['contentGeneration'],
    queryFn: () => makeWebhookCall(),
    enabled: false,
  });

  const handleSubmit = (additionalData = {}) => {
    refetch({ queryFn: () => makeWebhookCall(additionalData) });
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
          Generate
        </Button>
      </div>

      {isLoading && <p className="mt-4">Loading...</p>}
      {isError && <p className="mt-4 text-red-500">Error: {error.message}</p>}

      {data && data.result_text && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Generated Content:</h2>
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
          {data.result_image && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Generated Image:</h3>
              <img src={data.result_image} alt="Generated" className="max-w-full h-auto" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
