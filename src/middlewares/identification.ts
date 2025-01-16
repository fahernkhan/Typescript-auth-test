import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Custom interface untuk Request dengan properti user
interface CustomRequest extends Request {
    user?: JwtPayload & { verified: boolean };
}

export const identifier = (req: CustomRequest, res: Response, next: NextFunction): any => {
    // Mengambil token dari header Authorization atau cookies
    let token: string | undefined = req.headers.authorization || req.cookies['Authorization'];

    // Jika token tidak ada, kembalikan respons Unauthorized (401)
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        // Memeriksa apakah token mengikuti format 'Bearer <token>'
        if (!token.startsWith('Bearer ')) {
            return res.status(403).json({ success: false, message: 'Invalid token format' });
        }

        // Mengambil token setelah kata "Bearer"
        const userToken = token.split(' ')[1];

        // Mendapatkan secret token dari environment variables
        const secretToken = process.env.TOKEN_SECRET;

        // Jika secret token tidak ada atau invalid, kembalikan error
        if (!secretToken || secretToken.trim() === '') {
            return res.status(500).json({ success: false, message: 'Server misconfiguration: TOKEN_SECRET is missing or invalid' });
        }

        // Verifikasi token dengan secret dan dapatkan payload JWT
        const jwtVerified = jwt.verify(userToken, secretToken) as JwtPayload;

        // Jika token tidak valid atau pengguna belum terverifikasi, kembalikan error
        if (!jwtVerified || !jwtVerified.verified) {
            return res.status(403).json({ success: false, message: 'User is not verified' });
        }

        // Menyimpan informasi pengguna dalam req.user untuk digunakan di middleware berikutnya
        req.user = jwtVerified as CustomRequest['user'];

        // Lanjutkan ke middleware atau route handler berikutnya
        next();
    } catch (error) {
        // Menangani error terkait JWT, seperti token kadaluarsa atau tidak valid
        console.log(error);

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, message: 'Token expired' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }

        // Jika terjadi error lain, kembalikan pesan error umum
        return res.status(403).json({
            success: false,
            message: 'Token verification failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
