/**
 * @openapi
 * /api/v1/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create a new user account
 *     description: Create a new user account for either a tourist or a guide
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               guide:
 *                 type: boolean
 *                 default: false
 *               company_name:
 *                 type: string
 *                 description: Required if guide is true
 *               nationality:
 *                 type: string
 *                 description: Required if guide is true
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       "201":
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: >
 *                     User created successfully.
 *                     Check your email for verification.
 *       "400":
 *         description: Bad request
 *       "409":
 *         description: Conflict - User with this email or username already exists
 *       "500":
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login to an existing account
 *     description: Login to an existing account user should provide email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       "200":
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userid:
 *                   type: string
 *                 userRole:
 *                   type: string
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Forgot password
 *     description: Send a password reset link to the user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       "200":
 *         description: Password reset link sent successfully
 *       "400":
 *         description: Bad request
 *       "500":
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     description: Reset password by providing the reset code sent to the email, the email, and the new password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               resetCode:
 *                 type: string
 *             required:
 *               - email
 *               - newPassword
 *               - resetCode
 *     responses:
 *       "200":
 *         description: Password reset successful
 *       "400":
 *         description: Bad request
 *       "500":
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh token
 *     description: Obtain a new access token by providing a valid refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       "200":
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/v1/auth/resend-reset-code:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend reset code
 *     description: Resend the reset code to the user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       "200":
 *         description: Reset code sent successfully
 *       "400":
 *         description: Bad request
 *       "500":
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/v1/auth/verify:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify a user email
 *     description: Verify a user email by providing the email and the verification code sent to the email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *             required:
 *               - email
 *               - verificationCode
 *     responses:
 *       "200":
 *         description: User verified successfully
 *       "400":
 *         description: Bad request
 *       "500":
 *         description: Internal server error
 */
