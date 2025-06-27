const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAPI/Swagger specification
const openApiSpec = {
    openapi: "3.0.0",
    info: {
        title: "Instagram Posts API",
        version: "1.0.0",
        description: "API to retrieve Instagram posts by username",
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
    paths: {
        "/api/instagram/{username}": {
            get: {
                summary: "Get Instagram posts by username",
                description:
                    "Retrieve posts and images for a given Instagram username",
                parameters: [
                    {
                        name: "username",
                        in: "path",
                        required: true,
                        description: "Instagram username (without @ symbol)",
                        schema: {
                            type: "string",
                            example: "johndoe",
                        },
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        description: "Maximum number of posts to return",
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
                        description: "Successfully retrieved posts",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true,
                                        },
                                        username: {
                                            type: "string",
                                            example: "johndoe",
                                        },
                                        profile: {
                                            type: "object",
                                            properties: {
                                                username: { type: "string" },
                                                full_name: { type: "string" },
                                                profile_pic_url: {
                                                    type: "string",
                                                },
                                                followers_count: {
                                                    type: "integer",
                                                },
                                                following_count: {
                                                    type: "integer",
                                                },
                                                posts_count: {
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
                                                        enum: [
                                                            "image",
                                                            "video",
                                                        ],
                                                    },
                                                    timestamp: {
                                                        type: "string",
                                                        format: "date-time",
                                                    },
                                                    likes_count: {
                                                        type: "integer",
                                                    },
                                                    comments_count: {
                                                        type: "integer",
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    404: {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: false,
                                        },
                                        error: {
                                            type: "string",
                                            example: "User not found",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    500: {
                        description: "Server error",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: false,
                                        },
                                        error: { type: "string" },
                                    },
                                },
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

// Mock data for demonstration
const mockUserData = {
    johndoe: {
        profile: {
            username: "johndoe",
            full_name: "John Doe",
            profile_pic_url: "https://via.placeholder.com/150",
            followers_count: 1250,
            following_count: 300,
            posts_count: 45,
        },
        posts: [
            {
                id: "1",
                caption: "Beautiful sunset at the beach! 🌅",
                media_url:
                    "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Sunset",
                media_type: "image",
                timestamp: "2024-01-15T18:30:00Z",
                likes_count: 124,
                comments_count: 8,
            },
            {
                id: "2",
                caption: "Coffee and coding session ☕️💻",
                media_url:
                    "https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Coffee",
                media_type: "image",
                timestamp: "2024-01-14T09:15:00Z",
                likes_count: 89,
                comments_count: 12,
            },
            {
                id: "3",
                caption: "Weekend hiking adventure! 🏔️",
                media_url:
                    "https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Mountain",
                media_type: "image",
                timestamp: "2024-01-13T16:45:00Z",
                likes_count: 156,
                comments_count: 23,
            },
        ],
    },
};

// Utility function to simulate Instagram data fetching
async function fetchInstagramData(username, limit = 12) {
    // In a real implementation, you would:
    // 1. Use Instagram Basic Display API (requires user authentication)
    // 2. Use Instagram Graph API (for business accounts)
    // 3. Or implement web scraping (not recommended due to ToS)

    // This is a mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

    const userData = mockUserData[username.toLowerCase()];
    if (!userData) {
        throw new Error("User not found");
    }

    return {
        profile: userData.profile,
        posts: userData.posts.slice(0, limit),
    };
}

// API Routes
app.get("/api/instagram/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const limit = parseInt(req.query.limit) || 12;

        // Validate username
        if (!username || !/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
            return res.status(400).json({
                success: false,
                error: "Invalid username format",
            });
        }

        // Validate limit
        if (limit < 1 || limit > 50) {
            return res.status(400).json({
                success: false,
                error: "Limit must be between 1 and 50",
            });
        }

        const data = await fetchInstagramData(username, limit);

        res.json({
            success: true,
            username: username,
            profile: data.profile,
            posts: data.posts,
        });
    } catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        console.error("Error fetching Instagram data:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Instagram Posts API",
        documentation: "/api-docs",
        health: "/health",
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Something went wrong!",
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
    console.log(`🚀 Instagram API Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(
        `🔗 API Endpoint: http://localhost:${PORT}/api/instagram/{username}`
    );
});

module.exports = app;
