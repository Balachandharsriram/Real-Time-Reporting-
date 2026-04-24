const PDFDocument = require("pdfkit");

const generatePDF = (report, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.fontSize(18).text("Emergency Work Report", { align: "center" });

  doc.moveDown();
  doc.text(`Site: ${report.siteName}`);
  doc.text(`Work Type: ${report.workType}`);
  doc.text(`Priority: ${report.priority}`);
  doc.text(`Status: ${report.status}`);
  doc.text(`Workers: ${report.workers}`);
  doc.text(`Description: ${report.description}`);

  doc.end();
};

module.exports = generatePDF;