const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'iSafari API',
        version: '1.0.0',
        description: 'API documentation for LexResumeAi',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        {
          name: 'Authentication',
          description: 'Operations related to user authentication and account management',
        },
        {
          name: 'AI',
          description: 'AI Analysisroutes',
        },

      ],
    },
    apis: ['./docs/*.js'],
  };

module.exports = swaggerOptions;
