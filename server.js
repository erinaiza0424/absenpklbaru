const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('absensi.db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Buat tabel absensi jika belum ada
db.run(`CREATE TABLE IF NOT EXISTS absensi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT,
    waktu TEXT,
    tanggal TEXT,
    keterangan TEXT,
    latitude REAL,
    longitude REAL
)`);

// Endpoint untuk menerima data absensi
app.post('/absen', (req, res) => {
    const { nama, waktu, tanggal, keterangan, latitude, longitude } = req.body;
    db.run(
        'INSERT INTO absensi (nama, waktu, tanggal, keterangan, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
        [nama, waktu, tanggal, keterangan, latitude, longitude],
        function(err) {
            if (err) {
                return res.status(500).json({ status: 'error', message: err.message });
            }
            res.json({ status: 'success', id: this.lastID });
        }
    );
});

// Endpoint untuk melihat data absensi (opsional)
app.get('/absensi', (req, res) => {
    db.all('SELECT * FROM absensi', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        res.json(rows);
    });
});

app.get('/absensi/export', (req, res) => {
    db.all('SELECT * FROM absensi', [], (err, rows) => {
        if (err) {
            return res.status(500).send('Error exporting data');
        }
        let csv = 'id,nama,tanggal,waktu,keterangan,latitude,longitude\n';
        rows.forEach(row => {
            csv += `${row.id},"${row.nama}","${row.tanggal}","${row.waktu}","${row.keterangan}",${row.latitude},${row.longitude}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="absensi.csv"');
        res.send(csv);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});