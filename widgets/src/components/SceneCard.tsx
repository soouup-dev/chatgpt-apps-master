import type { StoryboardScene } from "../types";

type Props = {
  scene: StoryboardScene;
}

export function SceneCard({ scene }: Props) {
  const sceneNum = String(scene.sceneNumber).padStart(2, '0');
  return (
    <div className="flex gap-3 p-4 rounded-2x1 border border-white/10 bg-neutral-900">
      <div
        className="w-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: scene.bgColor }}
      />
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-neutral-100">
          Scene {sceneNum}
          <span className="text-white/40 font-normal ml-2">
            {scene.startTime}s - {scene.endTime}s
          </span>
        </p>
        <p className="text-sm text-neutral-100">{scene.description}</p>
        <p className="text-sm text-white/60">
          <span className="text-white/40">카메라 </span>{scene.cameraMovement}
        </p>
        <p className="text-sm text-white/60">
          <span className="text-white/40">카피 </span>{scene.copyText}
        </p>
        <p className="text-sm text-white/60">
          <span className="text-white/40">전환 </span>{scene.transition}
        </p>
        <p className="text-sm text-white/60">
          <span className="text-white/40">BGM </span>{scene.bgmDirection}
        </p>
      </div>
    </div>
  );
}