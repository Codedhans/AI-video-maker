# AI Video Maker - Setup Guide

## ⚠️ API Key Security

**NEVER** commit your API keys to the repository. Always use environment variables or a secure `.env` file.

## Getting Started

### 1. Get a Replicate API Key

1. Visit [https://replicate.com](https://replicate.com)
2. Sign up for a free account
3. Go to [https://replicate.com/account](https://replicate.com/account) to get your API token
4. Copy your API token

### 2. Configure Your Environment

**Option A: Using `.env` file (Local Development)**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API key
# REPLICATE_API_KEY=sk-your_actual_key_here
```

**Option B: Using the UI**
- Paste your API key directly in the "API Key (Optional)" field in the app
- This is NOT recommended for production

### 3. Deploy Safely

If deploying to the web:

1. **Use a backend server** to handle API calls (recommended for production)
2. **Never expose API keys** in client-side code
3. Use environment variables on your server/hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment
   - Heroku: Config Vars
   - AWS: Secrets Manager or Parameter Store

## Supported AI Models

### Replicate (Free Tier Available)
- **Stable Diffusion 3** - Fast, high quality
- **DALL-E 3** - OpenAI's model via Replicate
- **Custom models** - Add any model from Replicate's marketplace

Pricing: First 1,000 predictions free per month, then ~$0.0035 per second of compute

## Testing Without API Key

The app includes a demo mode that works without an API key:
1. Leave the API Key field empty
2. Click "Generate Video"
3. A demo animation will be generated locally

## Advanced: Backend Integration

For production use, create a backend endpoint:

```javascript
// Example: Node.js + Express backend
app.post('/api/generate-video', async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.REPLICATE_API_KEY; // Read from server env
  
  // Call Replicate API
  const prediction = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: 'model-id',
      input: { prompt }
    })
  });
  
  res.json(await prediction.json());
});
```

## Troubleshooting

**"API Error: Unauthorized"**
- Check that your API key is correct
- Verify the key hasn't expired
- Ensure it has the right permissions

**"Prediction failed"**
- Check the prompt for inappropriate content
- Try a shorter/simpler prompt
- Check your Replicate account status

**"No output generated"**
- The model may have failed
- Try again with a different prompt
- Check the Replicate dashboard for errors

## Resources

- [Replicate API Docs](https://replicate.com/docs/api)
- [Available Models](https://replicate.com/explore)
- [Pricing](https://replicate.com/pricing)
- [Status Page](https://status.replicate.com)

## Support

For issues with:
- **Replicate API**: Visit [Replicate Discord](https://discord.com/invite/2HFfs9sNDw)
- **This App**: Check GitHub issues or create a new one
