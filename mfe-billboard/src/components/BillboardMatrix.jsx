import React, { useEffect, useMemo, useState } from "react";
import eventBus from "shared/eventBus";
import "./BillboardMatrix.css";

export default function BillboardMatrix() {
  const [hackerCommand, setHackerCommand] = useState(null);
  const [powerOutage, setPowerOutage] = useState(null);
  const [riotIndex, setRiotIndex] = useState(0);
  const [glitchPulse, setGlitchPulse] = useState(false);
  const [crowdPanic, setCrowdPanic] = useState(null);
  const [radioBroadcast, setRadioBroadcast] = useState(null);

  const defaultPanels = [
    { text: "PIXEL COLA - TASTE THE FUTURE", color: "#940c16" },
    { text: "NEON BANK - YOUR CREDITS ARE SAFE", color: "#1f4ed8" },
    { text: "SYNTH WEAR - DRESS LIKE TOMORROW", color: "#5b2d9a" },
  ];

  const riotMessages = useMemo(
    () => ["RÉVOLUTION - MAINTENANT", "ILS NOUS MENTENT", "REJOIGNEZ-NOUS"],
    [],
  );

  const currentMessage = useMemo(() => {
    if (powerOutage === "total") {
      return "TOTAL BLACKOUT - SYSTEM COMPROMISED";
    }
    if (powerOutage === "partial") {
      return "POWER FAILURE - ZONES OFFLINE";
    }
    if (hackerCommand === "storm") {
      return "STORM WARNING - EVACUATE NOW";
    }
    if (hackerCommand === "riot") {
      return riotMessages[riotIndex % riotMessages.length];
    }
    if (hackerCommand === "love") {
      return "LOVE IS THE ANSWER";
    }
    if (hackerCommand === "blackout") {
      return "BLACKOUT RIGHT NOW - STAY AT HOME";
    }
    if (hackerCommand === "drones") {
      return "DRONE SWARM DETECTED - STAY INDOORS";
    }
    if (crowdPanic?.level > 20 && crowdPanic.level <= 50) {
      return `CROWD PANIC - ${crowdPanic.trending}`;
    }
    if (crowdPanic?.level > 50) {
      return `CROWD PANIC - ${crowdPanic.trending}`;
    }
    if (radioBroadcast?.isEmergency) {
      return `EMERGENCY BROADCAST - ${radioBroadcast.message}`;
    }
    return null;
  }, [hackerCommand, powerOutage, riotIndex, riotMessages, crowdPanic, radioBroadcast]);

  const currentColor = useMemo(() => {
    if (hackerCommand === "storm") {
      return "#ff8a1f";
    }
    if (hackerCommand === "riot") {
      return "#ff0033";
    }
    if (hackerCommand === "love") {
      return "#ff5aa5";
    }
    if (powerOutage) {
      return "#ff1f3d";
    }
    if (hackerCommand === "blackout") {
      return "#ff1f3d";
    }
    if (hackerCommand === "drones") {
      return "#00ff88";
    }
    if (crowdPanic?.level > 50) {
      return "#ff5500";
    }
    if (crowdPanic?.level > 20) {
      return "#ff9900";
    }
    if (radioBroadcast?.isEmergency) {
      return "#ff0033";
    }
    return null;
  }, [hackerCommand, powerOutage, crowdPanic, radioBroadcast]);

  useEffect(() => {
    if (!eventBus?.on) {
      return;
    }

    const handleHackerCommand = ({ command }) => {
      if (command === "reset") {
        setHackerCommand(null);
        setPowerOutage(null);
        setGlitchPulse(true);
        setRadioBroadcast(null);
        setCrowdPanic(null);
        return;
      }
      setHackerCommand(command);
    };

    const handlePowerOutage = ({ severity }) => {
      setPowerOutage(severity);
    };

    const handleCrowdPanic = ({ level, trending }) => {
      setCrowdPanic({ level, trending });
    };

    const handleRadioBroadcast = ({ message, isEmergency }) => {
      setRadioBroadcast({ message, isEmergency });
    };

    const unsubHacker = eventBus.on("hacker:command", handleHackerCommand);
    const unsubPower = eventBus.on("power:outage", handlePowerOutage);
    const unsubCrowd = eventBus.on("crowd:panic", handleCrowdPanic);
    const unsubRadio = eventBus.on("radio:broadcast", handleRadioBroadcast);

    return () => {
      unsubHacker?.();
      unsubPower?.();
      unsubCrowd?.();
      unsubRadio?.();
    };
  }, []);

  useEffect(() => {
    if (hackerCommand !== "riot") {
      setRiotIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setRiotIndex((index) => index + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [hackerCommand]);

  useEffect(() => {
    if (!glitchPulse) {
      return;
    }
    const timeout = setTimeout(() => setGlitchPulse(false), 900);
    return () => clearTimeout(timeout);
  }, [glitchPulse]);

  useEffect(() => {
    if (!eventBus?.emit || !currentMessage) {
      return;
    }
    eventBus.emit("billboard:message", {
      text: currentMessage,
      glitch: Boolean(hackerCommand || powerOutage || glitchPulse || radioBroadcast?.isEmergency),
      color: currentColor || "#ff0033",
    });
  }, [currentMessage, currentColor, hackerCommand, powerOutage, glitchPulse, radioBroadcast]);

  const getRandomItem = (items) =>
    items[Math.floor(Math.random() * items.length)];

  const getRandomHackerCommand = () =>
    getRandomItem(["storm", "riot", "love", "reset", "blackout", "drones"]);

  const getRandomPowerOutage = () => getRandomItem(["partial", "total"]);

  const simulateRandomHacker = () => {
    setHackerCommand((current) => {
      if (current !== null) {
        setPowerOutage(null);
        setGlitchPulse(true);
        setRadioBroadcast(null);
        setCrowdPanic(null);
        return null;
      }
      return getRandomHackerCommand();
    });
  };

  const simulateRandomPowerOutage = () => {
    setPowerOutage((current) => {
      if (current !== null) {
        return null;
      }
      return getRandomPowerOutage();
    });
  };

  const simulateRandomCrowdPanic = () => {
    setCrowdPanic((current) => {
      if (current !== null) {
        return null;
      }
      return { level: Math.floor(Math.random() * 100), trending: "up" };
    });
  };

  const simulateRandomRadioBroadcast = () => {
    setRadioBroadcast((current) => {
      if (current !== null) {
        return null;
      }
      return { message: "EMERGENCY BROADCAST", isEmergency: true };
    });
  };

  return (
    <div className="billboard-matrix">
      <div className="billboard-header">
        <span>BILLBOARD MATRIX</span>
        <span
          className={
            "glitch-badge" +
            (hackerCommand || powerOutage || glitchPulse || radioBroadcast?.isEmergency ? " active" : "")
          }
        >
          {hackerCommand !== null
            ? "HACKING"
            : powerOutage !== null
              ? "POWER OUTAGE"
              : radioBroadcast?.isEmergency
                ? "EMERGENCY BROADCAST"
                : crowdPanic?.level > 20
                  ? "CROWD PANIC"
                  : "BROADCAST"}
        </span>
      </div>

      <div className="button-group">
        <button className="simulate-btn" onClick={simulateRandomHacker}>
          SIMULATE HACK
        </button>
        <button className="simulate-btn" onClick={simulateRandomPowerOutage}>
          SIMULATE POWER OUTAGE
        </button>
        <button className="simulate-btn" onClick={simulateRandomCrowdPanic}>
          SIMULATE PANIC
        </button>
        <button className="simulate-btn" onClick={simulateRandomRadioBroadcast}>
          SIMULATE BROADCAST
        </button>
      </div>

      <div className="panels">
        {defaultPanels.map((panel, index) => (
          <Panel
            key={panel.text}
            index={index}
            text={panel.text}
            crisisText={currentMessage}
            hackerCommand={hackerCommand}
            powerOutage={powerOutage}
            glitchPulse={glitchPulse}
            crowdPanic={crowdPanic}
            radioBroadcast={radioBroadcast}
            color={panel.color}
            crisisColor={currentColor}
          />
        ))}
      </div>
    </div>
  );
}

const Panel = ({
  index,
  text,
  crisisText,
  hackerCommand,
  powerOutage,
  glitchPulse,
  crowdPanic,
  radioBroadcast,
  color,
  crisisColor,
}) => {
  const isCrisis = Boolean(hackerCommand || powerOutage || crowdPanic || radioBroadcast?.isEmergency);
  const isPartialOutage = powerOutage === "partial";
  const isTotalOutage = powerOutage === "total";
  const message = isCrisis && crisisText ? crisisText : text;
  const backgroundStyle = isCrisis
    ? {
      background:
        hackerCommand === "love"
          ? "linear-gradient(120deg, #ff76b8, #ff9a6b)"
          : crisisColor,
    }
    : { background: color };

  return (
    <div
      className={
        "panel" +
        (isCrisis ? " crisis" : "") +
        (isCrisis ? " glitching" : "") +
        (glitchPulse ? " glitch-pulse" : "") +
        (isPartialOutage && index % 2 === 1 ? " blackout-partial" : "") +
        (isTotalOutage ? " blackout-total" : "")
      }
      style={backgroundStyle}
    >
      <div className="panel-text">{message}</div>
      <div className="panel-scanlines" />
    </div>
  );
};
