import React, { useRef,useState,useEffect } from "react";
import './App.css';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";

import {  useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyDr2v3IH-gIOAeDpWypefgWSl-dSKU-oMU",
  authDomain: "reactchat-f7c5e.firebaseapp.com",
  projectId: "reactchat-f7c5e",
  storageBucket: "reactchat-f7c5e.appspot.com",
  messagingSenderId: "182539440477",
  appId: "1:182539440477:web:02c6f51db43d74deff18b4"
});


const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn (){
  const signInWithGoogle = () => {
    const provider= new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <div className="signInContainer">
    <button className="signIn" onClick={signInWithGoogle}>Sign In With Google</button>
    </div>
  )
}

function SignOut (){
  return auth.currentUser && (
    <button className="signOut" onClick={()=> auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();

  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(35);
  const [messages] = useCollectionData(query, {idField : "id"});
  const[formValue, setFormValue] = useState("");

  const sendMessage = async(e) => {
    e.preventDefault();
    if(formValue.trim() !=="" ){
    const{ uid, photoURL} = auth.currentUser; 
    await messageRef.add({
      text: formValue.trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
  
    setFormValue ("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  }
  }
  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message = {msg} />)}
        <div className="upperDummy"> </div>
        <div ref = {dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input className="input" value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button className ="send" type= "submit" >Send</button>
      </form>
    </>
  )

}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "recieved";
  return(
    <div className = {messageClass + "Container"}>
  
      <img className={"photoURL"+messageClass} src ={photoURL} alt ="" height ="20"/> 
      <p className={"message"+messageClass}>{text}</p> 
    
    </div>
  )
}

function App() {
  
  const dummy = useRef();
  const [user] = useAuthState(auth);
  const headerClass = user ? "header" : "transparent";
  useEffect(() => {window.scrollTo(0,document.body.scrollHeight)});
  return (
    <div className="App">
      <header className={headerClass}>
        {user ? <SignOut /> : null}
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

export default App;
