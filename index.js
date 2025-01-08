const express = require("express");
const cors = require('cors');
const mysql = require('mysql2');

const server = express();
const port = 8000;
server.set("view engine", "ejs");
server.use(express.json());
server.use(cors());
server.use(express.urlencoded({ extended: true }));

server.listen(port, () => {
    console.log(`Server: Server is running at http://localhost:${port}`);
});

const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'task_manager',
});

database.connect((error) => {
    if (error) {
        console.error('Database not connected');
        return;
    }
    console.log("Database: Database is connected!");
});

server.get("/", (req, res) => {
    res.status(200).render("create", {});
});

server.get("/viewall", (req, res) => {
    const query = `SELECT * FROM tasks WHERE status LIKE '%es%'`;
    
    database.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching tasks from the database:", err);
            return res.status(500).json({ message: "Database error" });
        }
        
        res.render("viewall", { tasks: results });
    });
});

server.post("/createsubmit", (req, res) => {
    const { title, description, status } = req.body;

    const query = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';
    database.query(query, [title, description, status], (err, results) => {
        if (err) {
            console.error("Error inserting into the database", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.redirect("/viewall");
    });
});

server.delete("/delete/:id", (req, res) => {
    const taskId = req.params.id;
    const query = 'DELETE FROM tasks WHERE id = ?';

    database.query(query, [taskId], (err, result) => {
        if (err) {
            console.error("Error deleting task from the database:", err);
            return res.status(500).json({ message: "Database error" });
        }
        
        res.status(200).json({ message: "Task deleted successfully" });
    });
});

server.put("/update/:id", (req, res) => {
    const taskId = req.params.id; // Get the task ID from the request parameters
    const query = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?'; // Fix WHERE clause
    const body = req.body;

    // Ensure taskId and body fields are passed correctly
    database.query(query, [body.title, body.description, body.status, taskId], (err, result) => {
        if (err) {
            console.error("Error updating task in the database:", err);
            return res.status(500).json({ message: "Database error" });
        }

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task updated successfully" });
    });
});

