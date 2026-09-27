import { afterEach, describe, expect, it, vi } from 'vitest';

import { SmtpEmailProvider } from './smtp.provider.js';

const sendMailMock = vi.fn();

vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn(() => ({
            sendMail: sendMailMock
        }))
    }
}));

vi.mock('../env.js', () => ({
    envs: {
        SMTP_URL: 'smtp://smtp.example.com',
        SMTP_FROM: 'Nango <noreply@example.com>'
    }
}));

describe('SmtpEmailProvider.send', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('sends an email with the configured sender and provided content', async () => {
        sendMailMock.mockResolvedValue(undefined);

        await new SmtpEmailProvider().send('user@example.com', 'Verify your email', '<p>Hi</p>');

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledWith({
            from: 'Nango <noreply@example.com>',
            to: 'user@example.com',
            subject: 'Verify your email',
            html: '<p>Hi</p>'
        });
    });

    it('propagates errors from the SMTP transporter', async () => {
        const error = new Error('SMTP connection failed');
        sendMailMock.mockRejectedValue(error);

        await expect(new SmtpEmailProvider().send('user@example.com', 'Verify your email', '<p>Hi</p>')).rejects.toThrow('SMTP connection failed');
    });
});
