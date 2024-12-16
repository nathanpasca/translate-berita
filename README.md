# Translation API

A Node.js API service that translates Indonesian text to multiple languages using Google's Gemini AI with OpenAI GPT-3.5 as a fallback.

## Features

- Translate Indonesian text to multiple languages
- Supports English, Chinese, Japanese, and Korean translations
- Uses Gemini AI as primary translation service
- Automatic fallback to OpenAI if Gemini fails
- Simple REST API interface

## Prerequisites

- Node.js (v16 or higher)
- npm
- Google Gemini API key
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone [https://github.com/nathanpasca/translate-berita]
cd translate-berita
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

## Usage

1. Start the server:
```bash
npm start
```

2. Make a translation request:
```bash
curl -X POST http://localhost:3000/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "saya adalah seorang yang hebat",
    "targetLang": "en,zh"
  }'
```

### API Endpoints

#### POST /translate
Translates Indonesian text to specified target languages.

**Request Body:**
```json
{
  "text": "String to translate",
  "targetLang": "en,zh,ja,ko"
}
```

**Response:**
```json
{
  "original_text": "Original Indonesian text",
  "translations": {
    "en": "English translation",
    "zh": "Chinese translation"
  }
}
```

### Supported Languages

- `en`: English
- `zh`: Chinese
- `ja`: Japanese
- `ko`: Korean

## Error Handling

The API will return appropriate error messages in the following cases:
- Missing required fields
- Unsupported target languages
- Translation service errors

## Development

To start the server in development mode:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.
