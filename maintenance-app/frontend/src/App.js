import { useState } from "react";
import axios from "axios";
import "./App.css";
import Dashboard from "./Dashboard";

export default function App() {
  const [page, setPage] = useState("form");

  const [form, setForm] = useState({
    siteName: "",
    workType: "",
    priority: "",
    status: "",
    workers: "",
    location: "",
    remarks: "",
    photoNo: "",
    supervisor: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    let err = {};

    Object.keys(form).forEach((key) => {
      if (key !== "description" && !form[key]) {
        err[key] = "Required";
      }
    });

    if (!beforeImage) err.beforeImage = "Required";
    if (!afterImage) err.afterImage = "Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });

      data.append("beforeImage", beforeImage);
      data.append("afterImage", afterImage);

      // Qatar Time
      data.append(
        "dateTime",
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Qatar",
        })
      );

      const res = await axios.post(
        "http://localhost:5000/api/reports",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      // Download PDF
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "report.pdf";
      link.click();

      // Reset form
      setForm({
        siteName: "",
        workType: "",
        priority: "",
        status: "",
        workers: "",
        location: "",
        remarks: "",
        photoNo: "",
        supervisor: "",
        description: "",
      });

      setBeforeImage(null);
      setAfterImage(null);

    } catch (err) {
      console.error("ERROR:", err);
      alert("Report generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>Maintenance</h2>

        <p onClick={() => setPage("form")}>Create Report</p>
        <p onClick={() => setPage("dashboard")}>View Reports</p>
      </div>

      {/* MAIN */}
      {page === "form" ? (
        <div className="main">
          <div className="card">
            <h2>Emergency Work Report</h2>

            <div className="grid">
              <Input label="Site Name" name="siteName" form={form} errors={errors} handleChange={handleChange} />

              <Select label="Work Type" name="workType" options={["Repair", "Replacement"]} form={form} errors={errors} handleChange={handleChange} />

              <Select label="Priority" name="priority" options={["Urgent", "Normal"]} form={form} errors={errors} handleChange={handleChange} />

              <Select label="Status" name="status" options={["Pending", "Reporting", "Completed"]} form={form} errors={errors} handleChange={handleChange} />

              <Input label="Workers" name="workers" form={form} errors={errors} handleChange={handleChange} />

              <Input label="Location" name="location" form={form} errors={errors} handleChange={handleChange} />

              <Input label="Photo No" name="photoNo" form={form} errors={errors} handleChange={handleChange} />

              <Input label="Supervisor Name" name="supervisor" form={form} errors={errors} handleChange={handleChange} />
            </div>

            <Textarea label="Description (Optional)" name="description" form={form} handleChange={handleChange} />

            <Textarea label="Remarks" name="remarks" form={form} handleChange={handleChange} error={errors.remarks} />

            <div className="image-row">
              <ImageUpload label="Before Image" setImage={setBeforeImage} error={errors.beforeImage} />
              <ImageUpload label="After Image" setImage={setAfterImage} error={errors.afterImage} />
            </div>

            <button className="button" onClick={handleSubmit}>
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      ) : (
        <Dashboard goBack={() => setPage("form")} />
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

const Input = ({ label, name, form, errors, handleChange }) => (
  <div className="field">
    <label>{label}</label>
    <input name={name} value={form[name]} onChange={handleChange} />
    {errors[name] && <p className="error">{errors[name]}</p>}
  </div>
);

const Select = ({ label, name, options, form, errors, handleChange }) => (
  <div className="field">
    <label>{label}</label>
    <select name={name} value={form[name]} onChange={handleChange}>
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
    {errors[name] && <p className="error">{errors[name]}</p>}
  </div>
);

const Textarea = ({ label, name, form, handleChange, error }) => (
  <div className="field">
    <label>{label}</label>
    <textarea name={name} value={form[name]} onChange={handleChange} />
    {error && <p className="error">{error}</p>}
  </div>
);

const ImageUpload = ({ label, setImage, error }) => {
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="image-box">
      <label>{label}</label>

      <input type="file" onChange={handleFile} />

      {preview && <img src={preview} alt="preview" />}

      {error && <p className="error">{error}</p>}
    </div>
  );
};