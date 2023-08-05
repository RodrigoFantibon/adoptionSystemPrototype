import { useState, useContext, useEffect } from 'react';
import { Sidebar } from '../../components/sidebar/sidebar'
import { ThemeContext } from '../../contextApi/ThemeContext';
import styles from './index.module.css';
import { AccordionQuestions } from '../../components/accordionQuestions/accordion.jsx';

export function Questions() { 
    const { darkMode, getLocalStorage } = useContext(ThemeContext);
    const [dataInCache, setdataInCache] = useState({});

    useEffect(() => {
        const usuarioLocalStorage = getLocalStorage();
        if (!usuarioLocalStorage) {
          window.location.href = '/login';
        } else {
          setdataInCache(usuarioLocalStorage);
        }
      }, []);

    return (
        <div className={`${darkMode ? styles.dark_mode : styles.light_mode}`}>
            <div className={styles.margin}>
                <h1>Perguntas</h1>
                <AccordionQuestions/>
            </div>
            <Sidebar/>
        </div>
    )
}