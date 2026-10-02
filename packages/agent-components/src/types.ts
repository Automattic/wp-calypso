export interface ColumnComponent {
	id: string;
	type: 'Column';
	children: string[];
}

export type TextComponent = {
	id: string;
	type: 'Text';
	content: { text: string };
} & (
	| { variant: 'heading' | 'body' | 'caption' }
	| { variant: 'status'; tone: 'neutral' | 'success' | 'warning' | 'error' }
);

export interface ButtonComponent {
	id: string;
	type: 'Button';
	label: string;
	action: string;
	variant: 'primary' | 'secondary' | 'link';
}

export type Component = ColumnComponent | TextComponent | ButtonComponent;

export interface Surface {
	protocol: 'minimal-ai-ui/0.1';
	rootId: string;
	components: Record< string, Component >;
	data: Record< string, never >;
}

export interface ComponentResult {
	protocol: 'agent-component/0.1';
	component: 'button-action';
	instanceId: string;
	revision: number;
	status: 'awaiting-input' | 'completed';
	summary: string;
	surface: Surface;
}

export interface ComponentActionRequest {
	protocol: 'agent-component/0.1';
	instanceId: string;
	expectedRevision: number;
	requestId: string;
	locale?: string;
	event: { name: string; values: Record< string, never > };
}
