import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

// Put your Vapi Public Key below.
const vapi = new Vapi(process.env.REACT_APP_VAPI_PUBLIC_KEY);
const assistantId = process.env.REACT_APP_ASSISTANT_ID;

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  // hook into Vapi events
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);

      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });
    //commit
    // we only want this to fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(assistantId);
  };
  const endCall = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!connected ? (
        <Button label="Call Airbnb Support" onClick={startCallInline} isLoading={connecting} />
      ) : (
        <ActiveCallDetail assistantIsSpeaking={assistantIsSpeaking} volumeLevel={volumeLevel} onEndCallClick={endCall} />
      )}

      {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
    </div>
  );
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  // close public key invalid message after delay
  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "25px",
        padding: "10px",
        color: "#fff",
        backgroundColor: "#f03e3e",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};
