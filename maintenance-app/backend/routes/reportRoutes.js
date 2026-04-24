const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const multer = require("multer");
const fs = require("fs");
const Report = require("../models/Report");

const upload = multer({ dest: "uploads/" });

/* ================= PDF GENERATOR ================= */
const generatePDF = (doc, data, beforePath, afterPath) => {

  /* HEADER */
  doc.fontSize(18).text("WORK REPORT", { align: "center" });
  doc.moveDown(1);

  const startX = 50;
  let y = doc.y;

  const rowHeight = 20;
  const col1Width = 150;
  const col2Width = 350;

  const drawRow = (label, value) => {
    doc.rect(startX, y, col1Width, rowHeight).stroke();
    doc.rect(startX + col1Width, y, col2Width, rowHeight).stroke();

    doc
      .fontSize(10)
      .text(label, startX + 5, y + 5)
      .text(value || "-", startX + col1Width + 5, y + 5);

    y += rowHeight;
  };

  drawRow("Site Name", data.siteName);
  drawRow("Work Type", data.workType);
  drawRow("Priority", data.priority);
  drawRow("Status", data.status);
  drawRow("Workers", data.workers);
  drawRow("Supervisor", data.supervisor);
  drawRow("Location", data.location);
  drawRow("Photo No", data.photoNo);
  drawRow("Date & Time", data.dateTime);

  /* DESCRIPTION */
  y += 10;
  doc.fontSize(12).text("Description", startX, y);
  y += 15;

  doc.rect(startX, y, 500, 60).stroke();
  doc.fontSize(10).text(data.description || "N/A", startX + 5, y + 5);

  /* REMARKS */
  y += 80;
  doc.fontSize(12).text("Remarks", startX, y);
  y += 15;

  doc.rect(startX, y, 500, 60).stroke();
  doc.fontSize(10).text(data.remarks || "N/A", startX + 5, y + 5);

  /* IMAGES */
  y += 90;

  const imgWidth = 220;
  const imgHeight = 150;

  if (beforePath && fs.existsSync(beforePath)) {
    doc.text("Before Work", startX, y);
    doc.image(beforePath, startX, y + 15, {
      fit: [imgWidth, imgHeight],
    });
  }

  if (afterPath && fs.existsSync(afterPath)) {
    doc.text("After Work", startX + imgWidth + 40, y);
    doc.image(afterPath, startX + imgWidth + 40, y + 15, {
      fit: [imgWidth, imgHeight],
    });
  }

  doc.end();
};

/* ================= CREATE REPORT ================= */
router.post(
  "/",
  upload.fields([
    { name: "beforeImage" },
    { name: "afterImage" },
  ]),
  async (req, res) => {
    try {
      console.log("BODY:", req.body); // DEBUG

      const data = req.body;

      const beforePath = req.files?.beforeImage?.[0]?.path;
      const afterPath = req.files?.afterImage?.[0]?.path;

      // Save first (better flow)
      const savedReport = await Report.create({
        ...data,
        beforeImage: beforePath,
        afterImage: afterPath,
      });

      const doc = new PDFDocument({ margin: 40 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

      doc.pipe(res);

      generatePDF(doc, savedReport, beforePath, afterPath);

    } catch (err) {
      console.error(err);
      res.status(500).send("PDF generation failed");
    }
  }
);

/* ================= PREVIEW (FIX YOUR ERROR) ================= */
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).send("Report not found");

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline"); // 🔥 PREVIEW MODE

    doc.pipe(res);

    generatePDF(doc, report, report.beforeImage, report.afterImage);

  } catch (err) {
    console.error(err);
    res.status(500).send("Preview failed");
  }
});

/* ================= DOWNLOAD ================= */
router.get("/:id/download", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).send("Report not found");

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    

    doc.pipe(res);

    generatePDF(doc, report, report.beforeImage, report.afterImage);

  } catch (err) {
    console.error(err);
    res.status(500).send("Download failed");
  }
});

/* ================= GET ALL ================= */
router.get("/", async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).send("Delete failed");
  }
});

module.exports = router;