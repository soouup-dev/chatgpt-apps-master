type Props = {
  colors: string[];
};

export function ColorPalette({ colors }: Props) {
  return (
    <div className="flex gap-3">
      {colors.map((color) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded-full border border-white/10"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-white/60">{color}</span>
        </div>
      ))}
    </div>
  );
}