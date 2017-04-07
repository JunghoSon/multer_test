import express from 'express';
//import bodyParser from 'body-parser';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));
app.use('/upload', express.static(path.join(__dirname, '../upload')));

const maxFileCount = 5;
const maxFileSize = 3 * 1000 * 1000;
const filePath = path.join(__dirname, '../upload');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, filePath);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});

const upload = multer({storage: storage, limits: {fileSize: maxFileSize}}).array('userPhoto', maxFileCount);

app.get('/', (req, res) => {
    fs.readFile('./public/upload.html', (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});

app.post('/api/photo', (req, res) => {
    upload(req, res, (err) => {
        let files = req.files;
        let fileCount = files.length;
        let originalFileNm = '';
        let savedFileNm = '';
        let fileSize = 0;
        let array = [];
        
        for(var i=0; i<fileCount; i++){
            originalFileNm = files[i].originalname;
            fileSize = files[i].size;
            savedFileNm = files[i].filename;
            
            array.push({
                originalName: files[i].originalname,
                savedName: files[i].filename,
                type: files[i].mimetype,
                size: files[i].size,
                src: '/upload/' + files[i].filename
            });
        }
        
        if(err) return res.end('Error');
        
        res.status(200).json({
            data: array
        });
    });
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});