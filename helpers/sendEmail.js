const nodemailer = require('nodemailer');
// const sgMail = require('@sendgrid/mail');
const clienturl = process.env.CLIENT_URL;

/**
 * 
 * this function sends an email to the specified email address
 * @param {*} to  email address to send the email to
 * @param {*} subject  email subject 
 * @param {*} text  email text content
 * @param {*} html  email html content
 */
const sendEmail = async (to, subject, text, html) => {
    try {
        const emailService = process.env.EMAIL_SERVICE;

        if (emailService === 'sendgrid') {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to,
                from: process.env.EMAIL_USER,
                subject,
                text,
                html,
            };
            await sgMail.send(msg);
            console.log('Email sent successfully via SendGrid');
        } else {
            let transporter = nodemailer.createTransport({
                service: emailService,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html,
            });

            console.log(`Email sent successfully via ${emailService}`);
        }
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};


// Create the email content for account verification
const createVerificationEmailContent = (user) => {
    const text = `Hello ${user.username},\n\n
                    Welcome to Isafari! Please click the link below to verify your account:\n\n
                    ${clienturl}/verify/${user.reset_code}\n\n
                    You can also copy and paste this verification code: ${user.reset_code}\n\n
                    Thank you!`;

    const html = `
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <h2>Welcome to Isafari!</h2>
                            <p>Hello ${user.username},</p>
                            <p>Please click the button below to verify your account:</p>
                            <p>
                                <a href="${clienturl}/verify/${user.reset_code}/${user.email}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                                    Verify Account
                                </a>
                            </p>
                            <p>Or copy and paste this verification code: <strong>${user.reset_code}</strong></p>
                            <p>Thank you for joining Isafari!</p>
                        </body>
                    </html>
    `;

    return { text, html };
};


// Create the email content for password reset code
const createResetCodeEmailContent = (user) => {
    const text = `Hello ${user.username},\n\n
                You requested to reset your password. Please use the code below to reset your password:\n\n
                ${user.reset_code}\n\n
                Kind regards,\n\n
                Isafari Team`;

    const html = `
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.username},</p>
            <p>You requested to reset your password. Please use the code below to reset your password:</p>
            <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${user.reset_code}</p>
            <p>If you didn't request a password reset, please ignore this email or contact support.</p>
            <p>Kind regards,<br>Isafari Team</p>
        </body>
    </html>
    `;

    return { text, html };
};


// Send the account verification email
const sendVerificationEmail = async (user) => {
    const subject = 'Account Verification';
    const { text, html } = createVerificationEmailContent(user);
    await sendEmail(user.email, subject, text, html);
    console.log('Verification email sent successfully');
};


// Send the password reset code email
const sendResetCode = async (user) => {
    const subject = 'Password Reset Code';
    const { text, html } = createResetCodeEmailContent(user);
    await sendEmail(user.email, subject, text, html);
    console.log('Reset password email sent successfully');
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendResetCode
};