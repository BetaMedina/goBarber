import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;
    try {
      const file = await File.create({
        name,
        path
      });
      return res.json({ data: file });
    } catch (e) {
      return res.status(400).json({ err: 'Image invalid' });
    }
  }
}

export default new FileController();
