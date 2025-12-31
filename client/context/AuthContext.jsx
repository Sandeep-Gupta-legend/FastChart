import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
const socketUrl = (import.meta.env.VITE_SOCKET_URL || backendUrl).replace(/\/$/, "").replace(/\/api$/, "");
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext()

export const AuthProvider = ({children})=>{
    const [token,setToken]=useState(localStorage.getItem("token"));
    const [authUser,setAuthUser]=useState(null);
    const [onlineUsers,setOnlineUsers]=useState([]);
    const [socket,setSocket]=useState(null);

    const handleLogoutState=()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        setSocket(null);
        axios.defaults.headers.common["token"]=null;
    }


    const checkAuth=async()=>{
        if(!token) return;
        try {
            const {data}=await axios.get("/api/auth/check");
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user);
            }else{
                handleLogoutState();
            }
        } catch (error) {
            handleLogoutState();
            toast.error(error.message);
        }
    }


    const login =  async(state,Credentials)=>{
        try {
            const {data}= await axios.post(`/api/auth/${state}`,Credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"]=data.token;
                setToken(data.token);
                localStorage.setItem("token",data.token);
                toast.success(data.message);
            }
            else{
                toast.error(data.message);
            }
            
        } catch (error) {
            toast.error(error.message);
        }
    }


    const logout = async()=>{
        handleLogoutState();
        toast.success("Logged out successfully");
        socket?.disconnect();
    }

    const updateProfile=async(body)=>{
        try {
            const {data}=await axios.put("/api/auth/update-profile",body);
            if(data.success){
                setAuthUser(data.userData);
                toast.success("profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket=io(socketUrl,{
            query:{
                userId:userData._id,
            }
        })
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds || []);

        })
        newSocket.on("connect_error",(err)=>{
            console.error("Socket connection error",err?.message);
            toast.error("Live connection lost");
        })
    }

    useEffect(()=>{
        if (token) {
            axios.defaults.headers.common["token"]=token;
            checkAuth();
        }

    },[token])

    const value={
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile

    }
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}