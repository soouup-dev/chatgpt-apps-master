import { useState } from 'react';
import type { App } from '@modelcontextprotocol/ext-apps';
import type { StoryboardProject, StoryboardScene } from '../types';

type Props = {
  app: App | null;
  projects: StoryboardProject[];
  onSelectProject: (project: StoryboardProject, scenes: StoryboardScene[]) => void;
  onDeleteProject: (projectId: string) => void;
};

type Filter = 'all' | 'short' | 'long';

function relativeTime(createdAt: string | null): string {
  if (!createdAt) return '';
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return '방금 전';
  if (diffH < 24) return `${diffH}시간 전`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}일 전`;
  return new Date(createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function isNew(createdAt: string | null): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24;
}

export function ProjectsScreen({ app, projects, onSelectProject, onDeleteProject }: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const filteredProjects = projects.filter((p) => {
    if (filter === 'short') return p.duration <= 30;
    if (filter === 'long') return p.duration > 30;
    return true;
  });

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

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirmingId !== projectId) {
      setConfirmingId(projectId);
      return;
    }
    handleConfirmedDelete(projectId);
  };

  const handleConfirmedDelete = async (projectId: string) => {
    if (!app) return;
    setConfirmingId(null);
    await app.callServerTool({
      name: 'delete-project',
      arguments: { projectId },
    });
    onDeleteProject(projectId);
  };

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)] text-[var(--foreground)]">
      <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">

        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-tertiary)]">
              Storyboard
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">프로젝트</h1>
            <p className="text-sm text-[var(--foreground-secondary)] mt-0.5">
              {projects.length}개의 프로젝트
            </p>
          </div>

          {/* 세그먼트 탭 */}
          <div className="flex gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] w-fit">
            {([
              ['all', '전체'],
              ['short', '숏폼'],
              ['long', '롱폼'],
            ] as [Filter, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={
                  filter === key
                    ? "text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--foreground)] text-[var(--background)] transition-colors"
                    : "text-xs font-medium px-3 py-1.5 rounded-md text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm text-[var(--foreground-tertiary)]">
              {projects.length === 0 ? '아직 프로젝트가 없어요' : '해당 조건의 프로젝트가 없어요'}
            </p>
            <p className="text-xs text-[var(--foreground-tertiary)]">새 스토리보드를 생성해보세요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center gap-2 rounded-2xl bg-[var(--surface)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <button
                  onClick={() => handleSelect(project)}
                  className="flex-1 min-w-0 flex items-start gap-3 text-left p-4"
                >
                  {/* 아바타 */}
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white/20"
                    style={{ backgroundColor: project.colorPalette[0] ?? '#888' }}
                  >
                    {project.projectName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-[var(--foreground-tertiary)] uppercase tracking-widest truncate">
                        {project.clientName}
                      </p>
                      {isNew(project.createdAt) && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white flex-shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                      {project.projectName}
                    </p>

                    {/* 컬러 팔레트 칩 */}
                    <div className="flex gap-1 mt-2">
                      {project.colorPalette.slice(0, 5).map((color, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-black/5"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] font-mono">
                        {project.duration}s
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] truncate max-w-[140px]">
                        {project.mood}
                      </span>
                      <span className="text-[10px] text-[var(--foreground-tertiary)]">
                        {relativeTime(project.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1 pr-3 flex-shrink-0">
                  <button
                    onClick={(e) => handleDeleteClick(e, project.id)}
                    className={
                      confirmingId === project.id
                        ? "text-[10px] font-medium px-2.5 py-1.5 rounded-full bg-red-500 text-white transition-colors whitespace-nowrap"
                        : "opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-full text-[var(--foreground-tertiary)] hover:bg-red-500/10 hover:text-red-500"
                    }
                  >
                    {confirmingId === project.id ? (
                      "삭제 확인"
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    )}
                  </button>
                  {confirmingId !== project.id && (
                    <span className="text-[var(--foreground-tertiary)] group-hover:text-[var(--foreground-secondary)] transition-colors text-sm">
                      →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
