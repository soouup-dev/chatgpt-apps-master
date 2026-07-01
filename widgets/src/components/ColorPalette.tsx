type Props = {
  colors: string[];
};

export function ColorPalette({ colors }: Props) {
  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <div key={color} className="flex flex-col items-center gap-1.5">
          <div
            className="w-8 h-8 rounded-lg shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-[10px] font-mono text-[var(--foreground-tertiary)] tracking-wide">
            {color.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
