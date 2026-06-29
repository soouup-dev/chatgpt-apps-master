import type { App } from '@modelcontextprotocol/ext-apps';
import type { StoryboardProject, StoryboardScene } from '../types';

type Props = {
  app: App | null;
  projects: StoryboardProject[];
  onSelectProject: (project: StoryboardProject, scenes: StoryboardScene[]) => void;
};

export function ProjectsScreen({ app, projects, onSelectProject }: Props) {
  const handleSelect = async (project: StoryboardProject) => {
    if (!app) return;
    const result = await app.callServerTool({
      name: 'get-storyboard',
      arguments: { projectId: project.id },
    });
    if (!result.isError && result.structuredContent) {
      const { project: p, scenes } = result.structuredContent as {
        project: StoryboardProject;
        scenes: StoryboardScene[];
      };
      onSelectProject(p, scenes);
    }
  };
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-3xl mx-auto p-5 flex flex-col gap-4">

        <header className="border-b border-white/10 pb-4">
          <h1 className="text-xl font-semibold">스토리보드 프로젝트</h1>
          <p className="text-sm text-white/40 mt-1">{projects.length}개의 프로젝트</p>
        </header>

        {projects.length === 0 ? (
          <p className="text-white/40 text-sm">아직 프로젝트가 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSelect(project)}
                className="text-left p-4 rounded-2xl border border-white/10 bg-neutral-900 hover:bg-neutral-800 transition-colors"
              >
                <p className="font-medium text-neutral-100">{project.projectName}</p>
                <p className="text-sm text-white/60 mt-0.5">{project.clientName}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-white/40">
                    {project.duration}초
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-white/40">
                    {project.mood}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}