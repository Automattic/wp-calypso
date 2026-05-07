export const cn = ( ...classes: any[] ) => classes.filter( Boolean ).join( ' ' );

export const AgentUI = {
	InputToolbar: ( {
		label,
		icon,
		children,
		disabled,
	}: {
		label: string;
		icon: React.ReactNode;
		children: React.ReactNode;
		disabled?: boolean;
		className?: string;
	} ) => (
		<div data-testid="input-toolbar">
			<button disabled={ disabled } data-testid="toolbar-button">
				{ icon }
				{ label }
			</button>
			<div data-testid="toolbar-content">{ children }</div>
		</div>
	),
};

export const RegenerateIcon = () => <span>Regenerate Icon</span>;
