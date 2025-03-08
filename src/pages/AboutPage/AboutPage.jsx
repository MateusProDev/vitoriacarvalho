import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import AboutCarousel from "../../components/About/AboutCarousel";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./AboutPage.css";

const AboutPage = () => {
  const [aboutData, setAboutData] = useState({
    description: "", // Carregar descrição
    aboutCarousel: {
      images: [] // Carregar imagens do carrossel
    }
  });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const aboutRef = doc(db, "content", "about");
        const aboutDoc = await getDoc(aboutRef);

        if (aboutDoc.exists()) {
          const data = aboutDoc.data();
          // Atualizando o estado com a descrição e o carrossel
          setAboutData({
            description: data.description || "", // Atualiza a descrição
            aboutCarousel: {
              images: data.aboutCarousel?.images || [] // Atualiza as imagens do carrossel
            }
          });
        } else {
          console.log("Nenhum dado encontrado para About");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchAboutData();
  }, []); // Apenas executa uma vez, quando o componente for montado

  return (
    <div className="about-page">
      <Header />

      {/* Carrossel */}
      <AboutCarousel images={aboutData.aboutCarousel?.images} />
      {/* Exibindo a descrição */}
      <p className="description">{aboutData.description}</p>
      <Footer />
    </div>
  );
};

export default AboutPage;
