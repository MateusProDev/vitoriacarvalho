import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditBoxes.css";

const EditBoxes = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newBox, setNewBox] = useState({ sectionIndex: null, title: "", content: "", image: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const boxesRef = doc(db, "content", "boxes");
        const boxesDoc = await getDoc(boxesRef);
        if (boxesDoc.exists()) {
          setSections(boxesDoc.data().sections || []);
        }
      } catch (error) {
        setError("Erro ao carregar dados.");
        console.error("Erro ao buscar dados:", error);
      }
    };
    fetchSections();
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");

    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload", formData);
      return response.data.secure_url;
    } catch (error) {
      setError("Falha no upload da imagem.");
      return null;
    }
  };

  const handleAddSection = () => {
    if (!newSectionTitle) {
      setError("Digite um título para a seção!");
      return;
    }
    setSections((prev) => [...prev, { title: newSectionTitle, boxes: [] }]);
    setNewSectionTitle("");
  };

  const handleAddBox = async () => {
    const { title, content, image, sectionIndex } = newBox;
    if (!title || !content || !image) {
      setError("Preencha todos os campos do box!");
      return;
    }

    setLoading(true);
    const imageUrl = await handleImageUpload(image);

    if (imageUrl) {
      const updatedSections = [...sections];
      updatedSections[sectionIndex].boxes.push({ title, content, imageUrl });

      try {
        await setDoc(doc(db, "content", "boxes"), { sections: updatedSections });
        setSections(updatedSections);
        setNewBox({ sectionIndex: null, title: "", content: "", image: null });
        setSuccess("Box adicionado com sucesso!");
      } catch (error) {
        setError("Erro ao salvar o box.");
      }
    }
    setLoading(false);
  };

  const handleDeleteBox = (sectionIndex, boxIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].boxes.splice(boxIndex, 1);

    setDoc(doc(db, "content", "boxes"), { sections: updatedSections })
      .then(() => setSections(updatedSections))
      .catch(() => setError("Erro ao excluir o box."));
  };

  const handleDeleteSection = (sectionIndex) => {
    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    setDoc(doc(db, "content", "boxes"), { sections: updatedSections })
      .then(() => {
        setSections(updatedSections);
        setSuccess("Seção excluída com sucesso!");
      })
      .catch(() => setError("Erro ao excluir a seção."));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "content", "boxes"), { sections });
      setSuccess("Alterações salvas!");
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    } catch (error) {
      setError("Erro ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-boxes">
      <h2>Editar Seções</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="add-section-form">
        <input
          type="text"
          placeholder="Nome da Seção"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
        />
        <button onClick={handleAddSection} disabled={loading}>
          Nova Seção
        </button>
      </div>

      <div className="sections-list">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="section">
            <h3>{section.title}</h3>
            <button onClick={() => handleDeleteSection(sectionIndex)} className="delete-section-btn" disabled={loading}>
              Excluir Seção
            </button>

            <div className="add-box-form">
              <input
                type="text"
                placeholder="Título"
                value={newBox.title}
                onChange={(e) => setNewBox({ ...newBox, title: e.target.value })}
              />
              <textarea
                placeholder="Descrição"
                value={newBox.content}
                onChange={(e) => setNewBox({ ...newBox, content: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewBox({ ...newBox, image: e.target.files[0], sectionIndex })}
              />
              <button onClick={handleAddBox} disabled={loading}>
                {loading ? "Adicionando..." : "Adicionar Box"}
              </button>
            </div>

            <div className="boxes">
              {section.boxes.map((box, boxIndex) => (
                <div key={boxIndex} className="box">
                  <img src={box.imageUrl} alt={box.title} />
                  <h4>{box.title}</h4>
                  <p>{box.content}</p>
                  <button onClick={() => handleDeleteBox(sectionIndex, boxIndex)} disabled={loading}>
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="save-all-btn" onClick={handleSave} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Tudo"}
      </button>
    </div>
  );
};

export default EditBoxes;