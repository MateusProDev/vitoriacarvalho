import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditBanner.css";

const EditBanner = () => {
  const navigate = useNavigate();
  const [bannerData, setBannerData] = useState({
    text: "",
    description: "",
    imageUrl: "",
    bgUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const bannerRef = doc(db, "content", "banner");
        const bannerDoc = await getDoc(bannerRef);

        if (bannerDoc.exists()) {
          setBannerData(bannerDoc.data());
        } else {
          console.log("Banner não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
      }
    };

    fetchBannerData();
  }, []);

  const handleImageUpload = async (file, field) => {
    if (!file || loading) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload`,
        formData
      );
      setBannerData(prev => ({ ...prev, [field]: response.data.secure_url }));
    } catch (error) {
      setError("Erro ao enviar imagem");
      console.error("Erro ao enviar imagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "content", "banner"), bannerData);
      setSuccess("Banner atualizado com sucesso!");
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    } catch (error) {
      console.error("Erro ao atualizar o banner:", error);
      setError("Erro ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-banner-panel">
      <h2>Editar Banner</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <label>Texto do Banner</label>
        <input
          type="text"
          value={bannerData.text}
          onChange={(e) => setBannerData({ ...bannerData, text: e.target.value })}
          required
        />

        <label>Descrição do Banner</label>
        <textarea
          value={bannerData.description}
          onChange={(e) => setBannerData({ ...bannerData, description: e.target.value })}
          required
        />

        <label>Imagem Principal</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0], "imageUrl")}
          disabled={loading}
        />
        {bannerData.imageUrl && <img src={bannerData.imageUrl} alt="Prévia" className="banner-preview" />}

        <label>Imagem de Fundo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0], "bgUrl")}
          disabled={loading}
        />
        {bannerData.bgUrl && <img src={bannerData.bgUrl} alt="Prévia" className="banner-preview" />}

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Banner"}
        </button>
      </form>
    </div>
  );
};

export default EditBanner;