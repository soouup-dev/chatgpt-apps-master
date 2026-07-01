import type { StoryboardScene } from "../types";

type Props = {
  scene: StoryboardScene;
}

export function SceneCard({ scene }: Props) {
  const sceneNum = String(scene.sceneNumber).padStart(2, '0');
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {scene.imageUrl && (
        <img
          src={scene.imageUrl}
          alt={`Scene ${sceneNum}`}
          className="w-full aspect-video object-contain bg-[var(--surface-secondary)]"
        />
      )}
      <div className="p-5">
        {/* 씬 번호 + 타임코드 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-widest text-[var(--foreground-tertiary)] uppercase">
              Scene {sceneNum}
            </span>
            <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <span className="text-[11px] text-[var(--foreground-tertiary)] font-mono">
              {scene.startTime}s — {scene.endTime}s
            </span>
          </div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: scene.bgColor }}
          />
        </div>

        {/* 씬 설명 */}
        <p className="text-sm text-[var(--foreground)] leading-relaxed mb-4">
          {scene.description}
        </p>

        {/* 메타 정보 */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--foreground-tertiary)] mb-0.5">카메라</p>
            <p className="text-xs text-[var(--foreground-secondary)]">{scene.cameraMovement}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--foreground-tertiary)] mb-0.5">전환</p>
            <p className="text-xs text-[var(--foreground-secondary)]">{scene.transition}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--foreground-tertiary)] mb-0.5">카피</p>
            <p className="text-xs text-[var(--foreground-secondary)]">{scene.copyText}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--foreground-tertiary)] mb-0.5">BGM</p>
            <p className="text-xs text-[var(--foreground-secondary)]">{scene.bgmDirection}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
