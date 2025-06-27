# Real Instagram API Setup Guide

## Current Situation (2025)

**Important**: Instagram Basic Display API was discontinued on December 4, 2024. This means you can no longer access personal Instagram accounts through the official API.

## Available Options

### 1. Instagram Graph API (Recommended)

-   **Works with**: Instagram Business and Creator accounts only
-   **Requires**: Facebook Developer Account
-   **Access**: Full API access with proper authentication
-   **Rate Limits**: Yes, but generous for legitimate use

### 2. Third-Party APIs

-   **Examples**: RapidAPI, Apify, etc.
-   **Cost**: Usually paid services
-   **Reliability**: Varies by provider

### 3. Web Scraping (Not Recommended)

-   **Status**: Unreliable and against Instagram's ToS
-   **Issues**: Frequent breaking changes, IP blocking
-   **Legal**: Potential ToS violations

## Setup Instructions for Instagram Graph API

### Step 1: Create Facebook Developer Account

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a developer account
3. Create a new app

### Step 2: Configure Your App

1. Add "Instagram Graph API" product to your app
2. Set up OAuth redirect URIs
3. Note your App ID and App Secret

### Step 3: Convert to Business Account

1. Convert your Instagram account to a Business or Creator account
2. Connect it to a Facebook Page

### Step 4: Install and Run

```bash
# Clone or create the project
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your Facebook app credentials
# Start the server
npm start
```

### Step 5: Get Access Token

1. Visit: `http://localhost:3000/api/auth/instagram?app_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI`
2. Follow the authorization flow
3. Exchange the code for an access token

### Step 6: Test the API

```bash
# Test business account endpoint
curl "http://localhost:3000/api/instagram/business/yourusername?access_token=YOUR_ACCESS_TOKEN"
```

## API Endpoints

### Business Account (Graph API)

```
GET /api/instagram/business/{username}?access_token=TOKEN&limit=25
```

### Authentication

```
GET /api/auth/instagram?app_id=ID&redirect_uri=URI
POST /api/auth/token
```

### Setup & Documentation

```
GET /api/setup
GET /api-docs
```

## Important Notes

1. **Business Accounts Only**: The Graph API only works with Instagram Business/Creator accounts
2. **Rate Limits**: Facebook enforces rate limits - be respectful
3. **Permissions**: You need proper permissions for each type of data
4. **Public Data**: No reliable way to access public profiles without authentication
5. **Compliance**: Always follow Instagram's Terms of Service

## Alternative Solutions

### Third-Party APIs

If you need to access public profiles or don't want to manage authentication:

1. **RapidAPI Instagram APIs**

    - Search for "Instagram" on RapidAPI
    - Various providers with different features
    - Usually paid but more reliable

2. **Apify Instagram Scrapers**

    - Professional scraping solutions
    - Handle anti-bot measures
    - Paid service with good reliability

3. **Custom Solutions**
    - Build your own scraping infrastructure
    - Use rotating proxies and user agents
    - High maintenance but full control

## Legal Considerations

-   Always respect Instagram's Terms of Service
-   Don't scrape at high rates
-   Consider user privacy
-   Some use cases may require user consent
-   Commercial use may have additional restrictions

## Troubleshooting

### Common Issues

1. **"No Instagram business account connected"**

    - Make sure your Instagram account is converted to Business/Creator
    - Ensure it's connected to a Facebook Page

2. **"Access token invalid"**

    - Tokens expire, regenerate them
    - Ensure proper permissions were granted

3. **Rate limit errors**

    - Implement proper rate limiting
    - Use exponential backoff for retries

4. **"User not found"**
    - Username might be incorrect
    - Account might be private
    - Account might not be a business account

### Getting Help

-   Check the [Instagram Graph API documentation](https://developers.facebook.com/docs/instagram-api/)
-   Use the `/api/setup` endpoint for configuration help
-   Test with the Swagger UI at `/api-docs`

## Security Best Practices

1. Never expose your App Secret in client-side code
2. Use environment variables for sensitive data
3. Implement proper rate limiting
4. Validate all input parameters
5. Use HTTPS in production
6. Rotate access tokens regularly

---

**Note**: This implementation provides a foundation for Instagram API integration. Depending on your specific needs, you may need to customize the endpoints and add additional features.
