const express = require("express");
const cors = require("cors");
const axios = require("axios");
const swaggerUi = require("swagger-ui-express");
const { IgApiClient } = require("instagram-private-api");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Instagram Graph API configuration
const INSTAGRAM_GRAPH_API_BASE = "https://graph.instagram.com";
const FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com";

// OpenAPI/Swagger specification
const openApiSpec = {
    openapi: "3.0.0",
    info: {
        title: "Instagram Posts API",
        version: "2.0.0",
        description:
            "Real Instagram API integration to retrieve posts by username",
        contact: {
            name: "API Support",
            email: "support@example.com",
        },
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: "Development server",
        },
    ],
    components: {
        securitySchemes: {
            FacebookAuth: {
                type: "http",
                scheme: "bearer",
                description: "Facebook/Instagram access token",
            },
        },
    },
    paths: {
        "/api/instagram/business/{username}": {
            get: {
                summary: "Get Instagram business account posts",
                description:
                    "Retrieve posts from Instagram Business/Creator accounts using Graph API",
                security: [{ FacebookAuth: [] }],
                parameters: [
                    {
                        name: "username",
                        in: "path",
                        required: true,
                        description: "Instagram business username",
                        schema: { type: "string", example: "businessaccount" },
                    },
                    {
                        name: "access_token",
                        in: "query",
                        required: true,
                        description: "Facebook/Instagram access token",
                        schema: { type: "string" },
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        description: "Number of posts to return",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                            default: 25,
                        },
                    },
                ],
                responses: {
                    200: {
                        description:
                            "Successfully retrieved business account posts",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                        username: { type: "string" },
                                        account_type: { type: "string" },
                                        profile: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                username: { type: "string" },
                                                name: { type: "string" },
                                                profile_picture_url: {
                                                    type: "string",
                                                },
                                                followers_count: {
                                                    type: "integer",
                                                },
                                                follows_count: {
                                                    type: "integer",
                                                },
                                                media_count: {
                                                    type: "integer",
                                                },
                                            },
                                        },
                                        posts: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    caption: { type: "string" },
                                                    media_url: {
                                                        type: "string",
                                                    },
                                                    media_type: {
                                                        type: "string",
                                                    },
                                                    timestamp: {
                                                        type: "string",
                                                    },
                                                    like_count: {
                                                        type: "integer",
                                                    },
                                                    comments_count: {
                                                        type: "integer",
                                                    },
                                                    permalink: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/instagram/public/{username}": {
            get: {
                summary: "Get public Instagram posts (Web scraping)",
                description:
                    "Retrieve public posts using web scraping - Use responsibly",
                parameters: [
                    {
                        name: "username",
                        in: "path",
                        required: true,
                        description: "Instagram username",
                        schema: { type: "string", example: "publicuser" },
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        description: "Number of posts to return",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 50,
                            default: 12,
                        },
                    },
                ],
                responses: {
                    200: {
                        description: "Successfully retrieved public posts",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                        username: { type: "string" },
                                        method: {
                                            type: "string",
                                            example: "web_scraping",
                                        },
                                        posts: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    shortcode: {
                                                        type: "string",
                                                    },
                                                    display_url: {
                                                        type: "string",
                                                    },
                                                    edge_media_to_caption: {
                                                        type: "object",
                                                    },
                                                    taken_at_timestamp: {
                                                        type: "integer",
                                                    },
                                                    edge_liked_by: {
                                                        type: "object",
                                                    },
                                                    edge_media_to_comment: {
                                                        type: "object",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/setup/facebook-app": {
            post: {
                summary: "Setup Facebook App Configuration",
                description:
                    "Configure Facebook App ID and Secret for Instagram Graph API",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    app_id: { type: "string" },
                                    app_secret: { type: "string" },
                                    redirect_uri: { type: "string" },
                                },
                                required: [
                                    "app_id",
                                    "app_secret",
                                    "redirect_uri",
                                ],
                            },
                        },
                    },
                },
            },
        },
    },
};

// Serve OpenAPI documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Instagram Graph API methods
class InstagramGraphAPI {
    constructor() {
        this.baseURL = INSTAGRAM_GRAPH_API_BASE;
        this.facebookBaseURL = FACEBOOK_GRAPH_API_BASE;
    }

    async getBusinessAccountInfo(accessToken) {
        try {
            // First, get the Facebook pages connected to the account
            const pagesResponse = await axios.get(
                `${this.facebookBaseURL}/me/accounts?access_token=${accessToken}`
            );

            if (
                !pagesResponse.data.data ||
                pagesResponse.data.data.length === 0
            ) {
                throw new Error("No Facebook pages found");
            }

            // Get Instagram business account connected to the page
            const pageId = pagesResponse.data.data[0].id;
            const pageToken = pagesResponse.data.data[0].access_token;

            const igAccountResponse = await axios.get(
                `${this.facebookBaseURL}/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
            );

            if (!igAccountResponse.data.instagram_business_account) {
                throw new Error("No Instagram business account connected");
            }

            const igAccountId =
                igAccountResponse.data.instagram_business_account.id;

            // Get Instagram account details
            const accountInfo = await axios.get(
                `${this.baseURL}/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${pageToken}`
            );

            return {
                accountId: igAccountId,
                accessToken: pageToken,
                profile: accountInfo.data,
            };
        } catch (error) {
            throw new Error(
                `Failed to get business account info: ${error.message}`
            );
        }
    }

    async getBusinessAccountPosts(accountId, accessToken, limit = 25) {
        try {
            const response = await axios.get(
                `${this.baseURL}/${accountId}/media?fields=id,caption,media_url,media_type,timestamp,like_count,comments_count,permalink&limit=${limit}&access_token=${accessToken}`
            );

            return response.data.data;
        } catch (error) {
            throw new Error(`Failed to get business posts: ${error.message}`);
        }
    }
}

// Web scraping method for public profiles
class InstagramWebScraper {
    constructor() {
        this.baseURL = "https://www.instagram.com";
    }

    async getPublicProfile(username) {
        try {
            const response = await axios.get(
                `${this.baseURL}/${username}/?__a=1&__d=dis`,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Accept-Encoding": "gzip, deflate, br",
                        DNT: "1",
                        Connection: "keep-alive",
                        "Upgrade-Insecure-Requests": "1",
                    },
                }
            );

            // Parse the response to extract Instagram data
            const htmlContent = response.data;
            const jsonMatch = htmlContent.match(
                /window\._sharedData = ({.*?});/
            );

            if (!jsonMatch) {
                throw new Error("Could not extract Instagram data");
            }

            const sharedData = JSON.parse(jsonMatch[1]);
            const userInfo = sharedData.entry_data.ProfilePage[0].graphql.user;

            return {
                profile: {
                    id: userInfo.id,
                    username: userInfo.username,
                    full_name: userInfo.full_name,
                    profile_pic_url: userInfo.profile_pic_url,
                    followers: userInfo.edge_followed_by.count,
                    following: userInfo.edge_follow.count,
                    posts_count: userInfo.edge_owner_to_timeline_media.count,
                },
                posts: userInfo.edge_owner_to_timeline_media.edges.map(
                    (edge) => edge.node
                ),
            };
        } catch (error) {
            // Fallback method using different approach
            return this.getPublicProfileFallback(username);
        }
    }

    async getPublicProfileFallback(username) {
        try {
            // Alternative method using Instagram's embed endpoint
            const response = await axios.get(
                `${this.baseURL}/p/${username}/embed/`,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                }
            );

            // This is a simplified fallback - you'd need to implement proper parsing
            throw new Error(
                "Public profile access is limited. Please use Instagram Graph API for business accounts."
            );
        } catch (error) {
            throw new Error(
                "Unable to access public profile. Instagram has restricted public access."
            );
        }
    }
}

// Initialize API classes
const igGraphAPI = new InstagramGraphAPI();
const igScraper = new InstagramWebScraper();

// Routes

// Business account route (Graph API)
app.get("/api/instagram/business/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const { access_token } = req.query;
        const limit = parseInt(req.query.limit) || 25;

        if (!access_token) {
            return res.status(400).json({
                success: false,
                error: "Access token is required for business accounts",
            });
        }

        // Get business account info
        const accountInfo = await igGraphAPI.getBusinessAccountInfo(
            access_token
        );

        // Check if username matches
        if (
            accountInfo.profile.username.toLowerCase() !==
            username.toLowerCase()
        ) {
            return res.status(404).json({
                success: false,
                error: "Username does not match the authenticated business account",
            });
        }

        // Get posts
        const posts = await igGraphAPI.getBusinessAccountPosts(
            accountInfo.accountId,
            accountInfo.accessToken,
            limit
        );

        res.json({
            success: true,
            username: accountInfo.profile.username,
            account_type: "business",
            profile: accountInfo.profile,
            posts: posts,
        });
    } catch (error) {
        console.error("Business account error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Public account route (Web scraping - LIMITED)
app.get("/api/instagram/public/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const limit = parseInt(req.query.limit) || 12;

        // Warning about limitations
        res.status(501).json({
            success: false,
            error: "Public profile scraping is no longer reliable due to Instagram's restrictions",
            recommendation: "Use Instagram Graph API with business accounts",
            alternatives: [
                "Convert to Instagram Business account",
                "Use Instagram Graph API",
                "Use third-party services like RapidAPI",
            ],
        });
    } catch (error) {
        console.error("Public scraping error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// OAuth setup route
app.get("/api/auth/instagram", (req, res) => {
    const { app_id, redirect_uri } = req.query;

    if (!app_id || !redirect_uri) {
        return res.status(400).json({
            success: false,
            error: "app_id and redirect_uri are required",
        });
    }

    const authURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${app_id}&redirect_uri=${encodeURIComponent(
        redirect_uri
    )}&scope=instagram_basic,pages_show_list,pages_read_engagement&response_type=code`;

    res.json({
        success: true,
        auth_url: authURL,
        instructions: [
            "1. Visit the auth_url to authorize your app",
            "2. Copy the authorization code from the redirect",
            "3. Exchange the code for an access token using /api/auth/token",
        ],
    });
});

// Token exchange route
app.post("/api/auth/token", async (req, res) => {
    try {
        const { code, app_id, app_secret, redirect_uri } = req.body;

        if (!code || !app_id || !app_secret || !redirect_uri) {
            return res.status(400).json({
                success: false,
                error: "code, app_id, app_secret, and redirect_uri are required",
            });
        }

        // Exchange code for access token
        const tokenResponse = await axios.get(
            `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${app_id}&redirect_uri=${encodeURIComponent(
                redirect_uri
            )}&client_secret=${app_secret}&code=${code}`
        );

        res.json({
            success: true,
            access_token: tokenResponse.data.access_token,
            token_type: tokenResponse.data.token_type,
            expires_in: tokenResponse.data.expires_in,
        });
    } catch (error) {
        console.error("Token exchange error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to exchange code for token",
        });
    }
});

// Setup instructions endpoint
app.get("/api/setup", (req, res) => {
    res.json({
        setup_instructions: {
            step1: "Create a Facebook App at https://developers.facebook.com/",
            step2: "Add Instagram Basic Display product to your app",
            step3: "Configure OAuth redirect URIs",
            step4: "Get your App ID and App Secret",
            step5: "Use /api/auth/instagram to get authorization URL",
            step6: "Exchange authorization code for access token",
            step7: "Use access token with /api/instagram/business/{username}",
        },
        required_permissions: [
            "instagram_basic",
            "pages_show_list",
            "pages_read_engagement",
        ],
        limitations: {
            business_accounts_only:
                "Only Instagram Business/Creator accounts work with Graph API",
            public_scraping_deprecated:
                "Public profile scraping is no longer reliable",
            rate_limits:
                "Graph API has rate limits - check Facebook documentation",
        },
    });
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Real Instagram Posts API",
        documentation: "/api-docs",
        setup: "/api/setup",
        health: "/health",
        note: "Instagram Basic Display API was discontinued Dec 2024. Use Graph API for business accounts.",
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Real Instagram API Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`⚙️  Setup Instructions: http://localhost:${PORT}/api/setup`);
    console.log(
        `🔐 Auth URL Generator: http://localhost:${PORT}/api/auth/instagram`
    );
    console.log(
        `\n⚠️  Important: Instagram Basic Display API was discontinued.`
    );
    console.log(
        `   Use Instagram Business accounts with Graph API for reliable access.`
    );
});

module.exports = app;
