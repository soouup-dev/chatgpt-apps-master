import type { App } from '@modelcontextprotocol/ext-apps';
import type { StoryboardProject, StoryboardScene } from '../types';
import type { View } from '../App';
import { ColorPalette } from '../components/ColorPalette';
import { SceneCard } from '../components/SceneCard';

type Props = {
  app: App | null;
  project: StoryboardProject;
  scenes: StoryboardScene[];
  onNavigate: (view: View) => void;
  onBackToList: () => void;
};

export function StoryboardScreen({ project, scenes, onBackToList }: Props) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-2xl mx-auto p-6 flex flex-col gap-8">

        {/* 헤더 */}
        <header className="flex flex-col gap-4">
          <button
            onClick={onBackToList}
            className="flex items-center gap-1.5 text-xs text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] w-fit transition-colors"
          >
            <span>←</span>
            <span>프로젝트 목록</span>
          </button>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--foreground-tertiary)]">
              {project.clientName}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{project.projectName}</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] font-mono">
              {project.duration}s
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--surface-secondary)] text-[var(--foreground-secondary)]">
              {project.mood}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--surface-secondary)] text-[var(--foreground-secondary)]">
              {project.typography.font} · {project.typography.style}
            </span>
          </div>
        </header>

        {/* 컬러 팔레트 */}
        <section className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-tertiary)]">
            Color Palette
          </p>
          <ColorPalette colors={project.colorPalette} />
        </section>

        <div className="h-px bg-[var(--border)]" />

        {/* 씬 목록 */}
        <section className="flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-tertiary)]">
            Scenes · {scenes.length}
          </p>
          {scenes.map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
        </section>

      </div>
    </div>
  );
}
