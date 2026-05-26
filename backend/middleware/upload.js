import multer from "multer";

const storage = multer.memoryStorage(); // store image as Buffer in RAM

export const upload = multer({ storage });
