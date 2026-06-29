import type { StoryboardScene } from "../types";

type Props = {
  scene: StoryboardScene;
}

export function SceneCard({ scene }: Props) {
  const sceneNum = String(scene.sceneNumber).padStart(2, '0');
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {scene.imageUrl && (
        <img
          src={scene.imageUrl}
          alt={`Scene ${sceneNum}`}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="flex gap-3 p-4">
      <div
        className="w-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: scene.bgColor }}
      />
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Scene {sceneNum}
          <span className="text-[var(--foreground-tertiary)] font-normal ml-2">
            {scene.startTime}s - {scene.endTime}s
          </span>
        </p>
        <p className="text-sm text-[var(--foreground)]">{scene.description}</p>
        <p className="text-sm text-[var(--foreground-secondary)]">
          <span className="text-[var(--foreground-tertiary)]">카메라 </span>{scene.cameraMovement}
        </p>
        <p className="text-sm text-[var(--foreground-secondary)]">
          <span className="text-[var(--foreground-tertiary)]">카피 </span>{scene.copyText}
        </p>
        <p className="text-sm text-[var(--foreground-secondary)]">
          <span className="text-[var(--foreground-tertiary)]">전환 </span>{scene.transition}
        </p>
        <p className="text-sm text-[var(--foreground-secondary)]">
          <span className="text-[var(--foreground-tertiary)]">BGM </span>{scene.bgmDirection}
        </p>
      </div>
      </div>
    </div>
  );
}
