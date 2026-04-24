import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./App.css";
const API = process.env.REACT_APP_API_URL || "https://real-time-reporting.onrender.com";
export default function Dashboard({ goBack }) {
  const [reports, setReports] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  /* ================= FETCH REPORTS ================= */
 const fetchReports = useCallback(async () => {
  try {
    const res = await axios.get(`${API}/api/reports`);
    setReports(res.data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}, []);
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /* ================= DOWNLOAD PDF ================= */
  const downloadPDF = async (id) => {
    try {
      const res = await axios.get(
  `${API}/api/reports/${id}/download`,
  { responseType: "blob" }
);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "report.pdf";
      link.click();
    } catch (err) {
      console.error("Download Error:", err);
      alert("Download failed");
    }
  };

  /* ================= PREVIEW PDF ================= */
  const previewPDF = async (id) => {
    try {
      const res = await axios.get(
  `${API}/api/reports/${id}/download`,
  { responseType: "blob" }
);

      const file = new Blob([res.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      setPreviewUrl(fileURL);
    } catch (err) {
      console.error("Preview Error:", err);
      alert("Preview failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;

    try {
      await axios.delete(`${API}/api/reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="main">
      <div className="card">
        <h2>Reports Dashboard</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th>Work</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>{r.siteName}</td>
                  <td>{r.workType}</td>
                  <td>{r.priority}</td>
                  <td>{r.status}</td>
                  <td>{r.dateTime}</td>

                  <td>
                    <div className="actions">

                      <button
                        className="btn btn-preview"
                        onClick={() => previewPDF(r._id)}
                      >
                        Preview
                      </button>

                      <button
                        className="btn btn-download"
                        onClick={() => downloadPDF(r._id)}
                      >
                        Download
                      </button>

                      <button
                        className="btn btn-delete"
                        onClick={() => deleteReport(r._id)}
                      >
                        Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="button" onClick={goBack}>
          Back to Form
        </button>
      </div>

      {/* ================= MODAL PREVIEW ================= */}
      {previewUrl && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-header">
              <h3>Report Preview</h3>
              <button onClick={() => setPreviewUrl(null)}>Close</button>
            </div>

            <iframe
              src={previewUrl}
              title="PDF Preview"
            />

          </div>
        </div>
      )}
    </div>
  );
}
