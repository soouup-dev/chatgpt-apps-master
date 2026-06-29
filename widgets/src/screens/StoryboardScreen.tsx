import type { App } from '@modelcontextprotocol/ext-apps';
import type { StoryboardProject, StoryboardScene } from '../types';
import type { View } from '../App';

type Props = {
  app: App | null;
  project: StoryboardProject;
  scenes: StoryboardScene[];
  onNavigate: (view: View) => void;
};

export function StoryboardScreen(_props: Props) {
  return <div>Storyboard</div>;
}