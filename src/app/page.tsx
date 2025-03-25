"use client";
import { useState, useRef, MouseEvent } from "react";
import { Button, Group, Title, Container, Tooltip } from "@mantine/core";
import { applyStyle } from "./utils";
import { backgroundColors, colors } from "./utils/constants";

interface StyleState {
  st: number;
  fg: number;
  bg: number;
}

export default function Home() {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Function to convert the HTML nodes to ANSI format
  const nodesToANSI = (nodes: NodeListOf<ChildNode>, states: StyleState[]): string => {
    let text = "";
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += (node as Text).textContent;
        continue;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.nodeName === "BR") {
          text += "\n";
          continue;
        }

        const ansiCode = +(element.className.split("-")[1]);
        const newState = Object.assign({}, states.at(-1));

        if (ansiCode < 30) newState.st = ansiCode;
        if (ansiCode >= 30 && ansiCode < 40) newState.fg = ansiCode;
        if (ansiCode >= 40) newState.bg = ansiCode;

        states.push(newState);

        text += `\x1b[${newState.st};${(ansiCode >= 40) ? newState.bg : newState.fg}m`;
        text += nodesToANSI(element.childNodes, states);

        states.pop();
        text += `\x1b[0m`;

        if (states.at(-1)?.fg !== 2) text += `\x1b[${states.at(-1)?.st};${states.at(-1)?.fg}m`;
        if (states.at(-1)?.bg !== 2) text += `\x1b[${states.at(-1)?.st};${states.at(-1)?.bg}m`;
      }
    }
    return text;
  };


  //function to copy the text to the clipboard

  const copyToClipboard = () => {
    if (!contentRef.current) return;

    const toCopy = "```ansi\n" + nodesToANSI(contentRef.current.childNodes, [{ st: 2, fg: 2, bg: 2 }]) + "\n```";
    navigator.clipboard.writeText(toCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const resetFormatting = () => {
    if (contentRef.current) {
      contentRef.current.innerHTML = "";
    }
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    applyStyle(e);
  };

  return (
    <Container size="md" px={200} py={50}>
      <Title className="text-white">Create Your Text</Title>
      <Group my={15}>
        <Button color="gray" onClick={resetFormatting} data-ansi="0" className="button style-button">
          Reset All
        </Button>
        <Button color="gray" onClick={handleButtonClick} data-ansi="1" className="button style-button ansi-1">
          Bold
        </Button>
        <Button size="xs" color="gray" onClick={handleButtonClick} data-ansi="4" className="button style-button ansi-4">
          Line
        </Button>
      </Group>

      <Group my={15}>
        <strong className="text-white">FG:</strong>
        {colors.map((item) => (
          <Tooltip key={item.code} label={item.name}>
            <Button
              data-ansi={item.code.slice(5).trim()}
              className={`button style-button ${item.code}-bg`}
              size="xs"
              style={{ backgroundColor: item.color, color: "#fff" }}
              onClick={handleButtonClick}
            >
              {""}
            </Button>
          </Tooltip>
        ))}
      </Group>

      <Group my={15}>
        <strong className="text-white">BG:</strong>
        {backgroundColors.map((item) => (
          <Tooltip key={item.code} label={item.name}>
            <Button
              data-ansi={item.code.slice(5).trim()}
              className={`button style-button ${item.code}`}
              size="xs"
              style={{ backgroundColor: item.color, color: "#fff" }}
              onClick={handleButtonClick}
            >
              {""}
            </Button>
          </Tooltip>
        ))}
      </Group>

      <div
        ref={contentRef}
        contentEditable
        className="editable-text text-white"
        style={{
          minHeight: "100px",
          padding: "10px",
          border: "1px solid #ccc",
          marginTop: "10px",
          outline: "none",
        }}
        suppressContentEditableWarning
      >
        Type your text here...
      </div>

      <Group mt={20}>
        <Button color={copySuccess ? "green" : "blue"} onClick={copyToClipboard}>
          {copySuccess ? "Copied to Clipboard!" : "Copy as Discord Format"}
        </Button>
      </Group>
    </Container>
  );
}
