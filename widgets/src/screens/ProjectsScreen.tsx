import type { App } from '@modelcontextprotocol/ext-apps';
import type { StoryboardProject, StoryboardScene } from '../types';

type Props = {
  app: App | null;
  projects: StoryboardProject[];
  onSelectProject: (project: StoryboardProject, scenes: StoryboardScene[]) => void;
};

export function ProjectsScreen(_props: Props) {
  return <div>Projects</div>;
}