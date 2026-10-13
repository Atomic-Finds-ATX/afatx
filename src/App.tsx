import WeaveReveal from "./components/WeaveReveal";

export default function App() {
  return (
    <main className="demo">
      <WeaveReveal className="demo__surface">
        <div className="demo__content">
          <p className="demo__label">Interactive background</p>
          <h1>Weave reveal</h1>
          <p>
            Move across this area. The pattern follows as a soft, widening wake
            and then settles back into the solid background.
          </p>
          <button type="button">Example element</button>
        </div>
      </WeaveReveal>
    </main>
  );
}
