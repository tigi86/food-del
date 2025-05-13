import jwt from "jsonwebtoken"


const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        returnres.json({ success: false, message: "Not authorized Login again" })
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "error" })

    }
}

export default authMiddleware;