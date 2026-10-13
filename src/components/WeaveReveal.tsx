"use client";

import {
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import weavePatternUrl from "../assets/weave-pattern.svg";

type WeaveRevealProps = {
  children: ReactNode;
  className?: string;
};

type TrailPoint = {
  x: number;
  y: number;
  createdAt: number;
};

type PatternLayout = {
  drawWidth: number;
  drawHeight: number;
  startX: number;
  startY: number;
};

const TRAIL_LIFETIME = 800;

function getPatternLayout(
  image: HTMLImageElement,
  width: number,
  height: number,
): PatternLayout {
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const startX = (width - drawWidth) / 2;
  const startY = (height - drawHeight) / 2;

  return {
    drawWidth,
    drawHeight,
    startX,
    startY,
  };
}

function drawWeave(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  layout: PatternLayout,
) {
  const { drawWidth, drawHeight, startX, startY } = layout;
  context.drawImage(image, startX, startY, drawWidth, drawHeight);
}

export default function WeaveReveal({
  children,
  className = "",
}: WeaveRevealProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const patternLayerRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const mask = document.createElement("canvas");
    const patternLayer = document.createElement("canvas");
    const pattern = new Image();
    maskRef.current = mask;
    patternLayerRef.current = patternLayer;

    const renderPatternLayer = () => {
      const { width, height } = sizeRef.current;
      if (!pattern.complete || !pattern.naturalWidth || !width || !height) return;

      patternLayer.width = width;
      patternLayer.height = height;
      const patternContext = patternLayer.getContext("2d");
      if (!patternContext) return;

      drawWeave(
        patternContext,
        pattern,
        getPatternLayout(pattern, width, height),
      );
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.ceil(bounds.width * dpr);
      const height = Math.ceil(bounds.height * dpr);

      canvas.width = width;
      canvas.height = height;
      mask.width = width;
      mask.height = height;
      sizeRef.current = { width, height, dpr };
      renderPatternLayer();
    };

    pattern.onload = renderPatternLayer;
    pattern.src = weavePatternUrl;
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const renderTrail = () => {
    const canvas = canvasRef.current;
    const mask = maskRef.current;
    const patternLayer = patternLayerRef.current;
    if (!canvas || !mask || !patternLayer?.width) {
      frameRef.current = null;
      return;
    }

    const context = canvas.getContext("2d");
    const maskContext = mask.getContext("2d");
    if (!context || !maskContext) return;

    const { width, height, dpr } = sizeRef.current;
    const now = performance.now();
    const points = pointsRef.current.filter(
      (point) => now - point.createdAt < TRAIL_LIFETIME,
    );
    pointsRef.current = points;

    context.clearRect(0, 0, width, height);
    maskContext.clearRect(0, 0, width, height);

    if (points.length > 1) {
      maskContext.save();
      maskContext.lineCap = "round";
      maskContext.lineJoin = "round";
      maskContext.filter = `blur(${23 * dpr}px)`;

      for (let index = 1; index < points.length; index++) {
        const previous = points[index - 1];
        const current = points[index];
        const dx = current.x - previous.x;
        const dy = current.y - previous.y;
        const distance = Math.hypot(dx, dy) || 1;
        const normalX = -dy / distance;
        const normalY = dx / distance;
        const distanceFromHead = 1 - index / points.length;
        const age = now - current.createdAt;
        const life = Math.max(0, 1 - age / TRAIL_LIFETIME);
        const opacity = life * life;
        const spread = (16 + distanceFromHead * 58) * dpr;
        const centerWidth = (40 + distanceFromHead * 108) * dpr;

        maskContext.globalAlpha = opacity * 0.86;
        maskContext.strokeStyle = "#fff";
        maskContext.lineWidth = centerWidth;
        maskContext.beginPath();
        maskContext.moveTo(previous.x * dpr, previous.y * dpr);
        maskContext.lineTo(current.x * dpr, current.y * dpr);
        maskContext.stroke();

        // These two lighter edges create the widening wake without a cursor halo.
        maskContext.globalAlpha = opacity * 0.42;
        maskContext.lineWidth = (20 + distanceFromHead * 34) * dpr;
        for (const side of [-1, 1]) {
          maskContext.beginPath();
          maskContext.moveTo(
            previous.x * dpr + normalX * spread * side,
            previous.y * dpr + normalY * spread * side,
          );
          maskContext.lineTo(
            current.x * dpr + normalX * spread * side,
            current.y * dpr + normalY * spread * side,
          );
          maskContext.stroke();
        }
      }

      maskContext.restore();
      context.drawImage(patternLayer, 0, 0);

      const head = points.at(-1);
      if (head) {
        const glow = context.createRadialGradient(
          head.x * dpr,
          head.y * dpr,
          0,
          head.x * dpr,
          head.y * dpr,
          138 * dpr,
        );
        glow.addColorStop(0, "rgba(232, 151, 94, 0.94)");
        glow.addColorStop(0.18, "rgba(194, 91, 34, 0.68)");
        glow.addColorStop(0.52, "rgba(194, 91, 34, 0.18)");
        glow.addColorStop(1, "rgba(194, 91, 34, 0)");
        context.globalCompositeOperation = "source-atop";
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = "source-over";
      }

      context.globalCompositeOperation = "destination-in";
      context.drawImage(mask, 0, 0);
      context.globalCompositeOperation = "source-over";
    }

    if (points.length > 1) {
      frameRef.current = requestAnimationFrame(renderTrail);
    } else {
      frameRef.current = null;
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const point = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      createdAt: performance.now(),
    };
    const previous = pointsRef.current.at(-1);

    if (!previous) {
      pointsRef.current.push({
        x: point.x - 70,
        y: point.y + 12,
        createdAt: point.createdAt - 70,
      });
      pointsRef.current.push(point);
    } else if (Math.hypot(point.x - previous.x, point.y - previous.y) > 3) {
      pointsRef.current.push(point);
      if (pointsRef.current.length > 60) pointsRef.current.shift();
    }

    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(renderTrail);
    }
  };

  return (
    <div
      ref={hostRef}
      className={`weave-reveal ${className}`}
      onPointerMove={handlePointerMove}
    >
      <canvas
        ref={canvasRef}
        className="weave-reveal__canvas"
        aria-hidden="true"
      />
      <div className="weave-reveal__content">{children}</div>
    </div>
  );
}
