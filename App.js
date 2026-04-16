
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch("https://ai.sps.dpdns.org/completion", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `User: ${input}\nAI:`, 
          n_predict: 200,
          stop: ["User:", "\n"] 
        }),
      });
      const data = await response.json();
      const aiMsg = { id: (Date.now() + 1).toString(), text: data.content, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      alert("Connection failed. Is Termux + Tunnel running?");
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>SPS AI Portal</Text></View>
      <FlatList data={messages} keyExtractor={m => m.id} renderItem={({item}) => (
        <View style={[styles.bubble, item.sender === 'user' ? styles.userB : styles.aiB]}>
          <Text>{item.text}</Text>
        </View>
      )} />
      <View style={styles.inputArea}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type to local AI..." />
        <TouchableOpacity style={styles.btn} onPress={sendMessage}><Text style={{color:'#fff'}}>{loading ? "..." : "Send"}</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 40, backgroundColor: '#2c3e50', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  inputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderBottomWidth: 1, marginRight: 10 },
  btn: { backgroundColor: '#3498db', padding: 10, borderRadius: 5 },
  bubble: { margin: 5, padding: 10, borderRadius: 10, maxWidth: '80%' },
  userB: { alignSelf: 'flex-end', backgroundColor: '#e1ffc7' },
  aiB: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0' }
});


