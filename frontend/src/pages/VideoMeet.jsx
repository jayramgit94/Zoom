import React, { useEffect, useRef, useState, useContext } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment";
import { AuthContext } from "../contexts/AuthContext";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const { addToUserHistory } = useContext(AuthContext);

  var socketRef = useRef();
  let socketIdRef = useRef();
  // reference to the local video

  let localVideoref = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  // reference to the local video will take permission from user

  let [audioAvailable, setAudioAvailable] = useState(true);
  // reference to the local video will take permission from user

  let [video, setVideo] = useState(false);
  //vedio turn on or off jesa button

  let [audio, setAudio] = useState(false);
  // same as this ane mute like
  let [screen, setScreen] = useState(false);
  // screen shre ke liye button

  let [showModal, setModal] = useState(true);
  //chat model open or close

  let [screenAvailable, setScreenAvailable] = useState(false);
  // to check screen share permission

  let [messages, setMessages] = useState([]);
  // all chat messages

  let [message, setMessage] = useState("");
  // current message to be sent jo hum likh rhe honge

  let [newMessages, setNewMessages] = useState(3);
  //jaha pr likhenege new message ka badge show hoga

  let [askForUsername, setAskForUsername] = useState(true);
  // to ask for username jab koi guest se login kr rha hoga

  let [username, setUsername] = useState("");
  // to store the username of the user

  const videoRef = useRef([]);
  // reference to the video elements

  let [videos, setVideos] = useState([]);

  // TODO
  // if(isChrome() === false) {

  // }

  useEffect(() => {
    console.log("HELLO");
    getPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .catch((e) => console.log(e));
      }
    } else {
      // Switch back to camera when screen sharing is turned off
      getUserMedia();
    }
  };

  const getPermissions = async () => {
    //camera permission is there
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }
      // microphone permission is there
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
            //stream ko video element me dal diya
          }
        }
      }
    } catch (error) {
      console.log(error);
    }

    // Check screen sharing availability separately (not dependent on camera/mic)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
        console.log("✅ Screen sharing is available");
      } else {
        setScreenAvailable(false);
        console.log(
          "❌ Screen sharing is NOT available - getDisplayMedia not found"
        );
      }
    } catch (err) {
      console.log("Screen sharing check error:", err);
      setScreenAvailable(false);
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
      console.log("SET STATE HAS ", video, audio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, audio]);
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    // Add or replace tracks in all peer connections
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      // Replace video and audio tracks
      stream.getTracks().forEach((track) => {
        const sender = connections[id]
          .getSenders()
          .find((s) => s.track && s.track.kind === track.kind);

        if (sender) {
          sender.replaceTrack(track).catch((e) => console.log(e));
        } else {
          connections[id].addTrack(track, stream).catch((e) => console.log(e));
        }
      });

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  let getUserMedia = () => {
    if (screen) {
      // Skip if screen sharing is active
      return;
    }

    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (err) {
        console.log(err);
      }
    }
  };

  let getDislayMediaSuccess = (stream) => {
    console.log("HERE - Screen share started");
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    // Replace tracks in all peer connections with screen share stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      // Replace video tracks with screen share
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const sender = connections[id]
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack).catch((e) => console.log(e));
        }
      }

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          console.log("Screen share track ended");
          setScreen(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          // Wait for their ice candidate

          //ice == interactive connectivity establishment
          //use of ice candidate is to find the best path to connect peers

          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,

                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream - use modern ontrack instead of deprecated onaddstream
          connections[socketListId].ontrack = (event) => {
            console.log("TRACK RECEIVED:", event.track.kind);
            const stream = event.streams[0];
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);
            // check if we already have a video with this id
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: stream,
                autoplay: true,
                playsinline: true,
              };
              // add it to the video array
              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream tracks
          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              if (
                window.localStream !== undefined &&
                window.localStream !== null
              ) {
                window.localStream.getTracks().forEach((track) => {
                  const sender = connections[id2]
                    .getSenders()
                    .find((s) => s.track && s.track.kind === track.kind);

                  if (!sender) {
                    connections[id2].addTrack(track, window.localStream);
                  }
                });
              }
            } catch (err) {
              console.log(err);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    // set frequency to 0 to get silence
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = () => {
    setVideo(!video);
    // getUserMedia();
  };
  let handleAudio = () => {
    setAudio(!audio);
    // getUserMedia();
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);
  let handleScreen = () => {
    if (!screenAvailable) {
      alert(
        "Screen sharing is not available in your browser. Please use Chrome, Edge, or Firefox."
      );
      console.log("Screen sharing not available in this browser");
      return;
    }
    console.log("Screen Available state:", screenAvailable);
    console.log("Current screen state:", screen);
    console.log(
      "navigator.mediaDevices.getDisplayMedia exists:",
      !!navigator.mediaDevices?.getDisplayMedia
    );
    console.log("Toggling screen to:", !screen);
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (err) {
      console.log(err);
    }
    window.location.href = "/";
  };

  let openChat = () => {
    setModal(true);
    setNewMessages(0);
  };
  let closeChat = () => {
    setModal(false);
  };
  let handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  let sendMessage = () => {
    console.log(socketRef.current);
    socketRef.current.emit("chat-message", message, username);
    setMessage("");

    // this.setState({ message: "", sender: username })
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();

    // Extract meeting code from URL and add to history
    try {
      const meetingCode = window.location.pathname.split("/").pop();
      console.log("Adding to history - Meeting code:", meetingCode);
      addToUserHistory(meetingCode);
    } catch (err) {
      console.log("Error adding to history:", err);
    }
  };

  return (
    <div>
      {askForUsername === true ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#000",
            color: "white",
            gap: "20px",
          }}
        >
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            style={{ width: "300px" }}
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div
            style={{
              width: "400px",
              height: "300px",
              borderRadius: "10px",
              overflow: "hidden",
              border: "2px solid #0066cc",
            }}
          >
            <video
              ref={localVideoref}
              autoPlay
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            ></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      console.log(messages);
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainers}>
            <IconButton
              onClick={handleVideo}
              style={{
                color: "white",
                padding: "10px",
                borderRadius: "50%",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton
              onClick={handleEndCall}
              style={{
                color: "red",
                padding: "10px",
                borderRadius: "50%",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <CallEndIcon />
            </IconButton>
            <IconButton
              onClick={handleAudio}
              style={{
                color: "white",
                padding: "10px",
                borderRadius: "50%",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            <IconButton
              onClick={handleScreen}
              style={{
                color: "white",
                padding: "10px",
                borderRadius: "50%",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
              title={
                screenAvailable
                  ? "Click to share screen"
                  : "Screen sharing not available"
              }
            >
              {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </IconButton>

            <Badge badgeContent={newMessages} max={999} color="orange">
              <IconButton
                onClick={() => setModal(!showModal)}
                style={{
                  color: "white",
                  padding: "10px",
                  borderRadius: "50%",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <ChatIcon />{" "}
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          ></video>

          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
