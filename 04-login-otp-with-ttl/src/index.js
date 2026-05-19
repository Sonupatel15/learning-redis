import Redis from 'ioredis';
import express from 'express';

const app = express();

app.use(express.json());

const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
);

function otpKey(phone) {
  return `otp:${phone}`;
}

app.post('/otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required',
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Store OTP with expiry
    await redis.set(
      otpKey(phone),
      otp,
      'EX',
      30
    );

    // TODO:
    // Send OTP using SMS provider

    res.json({
      message: 'OTP sent successfully',
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        error: 'Phone and OTP are required',
      });
    }

    const storedOtp = await redis.get(
      otpKey(phone)
    );

    // OTP expired or not found
    if (!storedOtp) {
      return res.status(400).json({
        message: 'OTP expired or invalid',
      });
    }

    // Compare OTP
    if (storedOtp !== otp) {
      return res.status(400).json({
        message: 'Incorrect OTP',
      });
    }

    // Delete OTP after successful verification
    await redis.del(otpKey(phone));

    res.json({
      message: 'OTP verified successfully',
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.get('/otp/:phone/ttl', async (req, res) => {
  try {
    const ttl = await redis.ttl(
      otpKey(req.params.phone)
    );

    res.json({ ttl });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});