import { createContext, useContext, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, 
    query, where, getDocs, getDoc, serverTimestamp 
} from 'firebase/firestore';

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
    const [forms, setForms] = useState([]);
    const [responses, setResponses] = useState([]);
    const [currentForm, setCurrentForm] = useState(null);

    const fetchUserForms = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const q = query(collection(db, 'forms'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const userForms = [];
            querySnapshot.forEach((doc) => {
                userForms.push({ id: doc.id, ...doc.data() });
            });
            setForms(userForms);
            return userForms;
        } catch (error) {
            console.error("Error fetching user forms:", error);
            return [];
        }
    }, []);

    const fetchPublicForm = useCallback(async (formId) => {
        try {
            const docRef = doc(db, 'forms', formId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const formData = { id: docSnap.id, ...docSnap.data() };
                setCurrentForm(formData);
                return formData;
            } else {
                setCurrentForm(null);
                return null;
            }
        } catch (error) {
            console.error("Error fetching public form:", error);
            setCurrentForm(null);
            return null;
        }
    }, []);

    const fetchFormResponses = useCallback(async (formId) => {
        try {
            const q = query(collection(db, 'responses'), where('formId', '==', formId));
            const querySnapshot = await getDocs(q);
            const formResponses = [];
            querySnapshot.forEach((doc) => {
                formResponses.push({ id: doc.id, ...doc.data() });
            });
            setResponses(formResponses);
            return formResponses;
        } catch (error) {
            console.error("Error fetching form responses:", error);
            return [];
        }
    }, []);

    const addForm = async (form, userId) => {
        try {
            const docRef = await addDoc(collection(db, 'forms'), {
                ...form,
                userId,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding form:", error);
            throw error;
        }
    };

    const updateForm = async (id, updatedForm) => {
        try {
            const formRef = doc(db, 'forms', id);
            await updateDoc(formRef, updatedForm);
        } catch (error) {
            console.error("Error updating form:", error);
            throw error;
        }
    };

    const deleteForm = async (id) => {
        try {
            await deleteDoc(doc(db, 'forms', id));
            setForms(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error("Error deleting form:", error);
            throw error;
        }
    };

    const submitResponse = async (formId, data) => {
        try {
            const docRef = await addDoc(collection(db, 'responses'), {
                formId,
                answers: data,
                submittedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error submitting response:", error);
            throw error;
        }
    };

    return (
        <FeedbackContext.Provider value={{
            forms,
            responses,
            currentForm,
            fetchUserForms,
            fetchPublicForm,
            fetchFormResponses,
            addForm,
            updateForm,
            deleteForm,
            submitResponse
        }}>
            {children}
        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => useContext(FeedbackContext);
