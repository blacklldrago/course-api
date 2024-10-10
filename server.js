const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;

// In-memory "database" with the structure of courses array
let coursesData = {
    courses: []
};
let currentId = 1;

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Middleware to parse JSON requests
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// GET all courses
app.get('/courses', (req, res) => {
    res.json(coursesData);
});

// POST a new course with image
app.post('/courses', upload.single('image'), (req, res) => {
    const { name, desc, link, price } = req.body;
    const newCourse = {
        id: currentId++,
        name,
        desc,
        link,
        price,
        image: req.file ? `/uploads/${req.file.filename}` : null
    };
    coursesData.courses.push(newCourse);
    res.status(201).json(newCourse);
});

// PUT (update) a course
app.put('/courses/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, desc, link, price } = req.body;
    const course = coursesData.courses.find(c => c.id == id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Update fields
    course.name = name || course.name;
    course.desc = desc || course.desc;
    course.link = link || course.link;
    course.price = price || course.price;
    if (req.file) {
        course.image = `/uploads/${req.file.filename}`;
    }

    res.json(course);
});

// DELETE a course
app.delete('/courses/:id', (req, res) => {
    const { id } = req.params;
    const courseIndex = coursesData.courses.findIndex(c => c.id == id);
    if (courseIndex === -1) return res.status(404).json({ message: 'Course not found' });

    coursesData.courses.splice(courseIndex, 1);
    res.status(204).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
