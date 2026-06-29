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
};

export function StoryboardScreen({ project, scenes, onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-3xl mx-auto p-5 flex flex-col gap-6">

        {/* 헤더 */}
        <header className="flex flex-col gap-1 border-b border-white/10 pb-4">
          <button
            onClick={() => onNavigate('storyboard-projects')}
            className="text-sm text-white/40 hover:text-white/60 w-fit mb-2"
          >
            ← 목록으로
          </button>
          <h1 className="text-xl font-semibold">{project.projectName}</h1>
          <p className="text-sm text-white/60">{project.clientName}</p>
          <div className="flex gap-3 mt-1">
            <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-white/60">
              {project.duration}초
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-white/60">
              {project.mood}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-white/60">
              {project.typography.font} · {project.typography.style}
            </span>
          </div>
        </header>

        {/* 컬러 팔레트 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-white/40">컬러 팔레트</h2>
          <ColorPalette colors={project.colorPalette} />
        </section>

        {/* 씬 목록 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-white/40">씬 구성</h2>
          {scenes.map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
        </section>

      </div>
    </div>
  );
}