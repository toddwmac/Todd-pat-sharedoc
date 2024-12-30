import * as Y from 'https://cdn.skypack.dev/yjs';
import { WebrtcProvider } from 'https://cdn.skypack.dev/y-webrtc';
import { IndexeddbPersistence } from 'https://cdn.skypack.dev/y-indexeddb';
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabaseUrl = "https://fuwesfbwsivwsensswtw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1d2VzZmJ3c2l2d3NlbnNzd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNDEwODIsImV4cCI6MjA1MDgxNzA4Mn0.BlRsP0eJzCs9ONvntWtAfttNYon2NvQkzhaF_h8EkQc";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Yjs document and providers
const doc = new Y.Doc();
const provider = new WebrtcProvider('shared-document-room', doc);
const text = doc.getText('shared-text');
const textarea = document.getElementById('editor');
const saveButton = document.getElementById('save-button');
const detonateButton = document.getElementById('detonate-button');

// Sync textarea with Yjs text
textarea.value = text.toString();

text.observe(() => {
    if (textarea !== document.activeElement) {
        textarea.value = text.toString();
    }
});

textarea.addEventListener('input', () => {
    const cursorPosition = textarea.selectionStart;
    text.delete(0, text.length);
    text.insert(0, textarea.value);
    textarea.setSelectionRange(cursorPosition, cursorPosition);
});

// Save button logic
saveButton.addEventListener('click', async () => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .upsert({ id: 1, content: text.toString() }, { onConflict: 'id' });
        if (error) {
            alert('Error saving document: ' + error.message);
        } else {
            alert('Document saved successfully!');
        }
    } catch (error) {
        console.error('Save error:', error);
    }
});

// Detonate button logic
detonateButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the document? This action cannot be undone.')) {
        text.delete(0, text.length);
    }
});

// Load document from Supabase on startup
(async () => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('content')
            .eq('id', 1)
            .single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error loading document:', error.message);
        } else if (data) {
            text.insert(0, data.content);
        }
    } catch (error) {
        console.error('Startup load error:', error);
    }
})();