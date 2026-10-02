export interface ComponentNode {
	id: string;
	type: string;
}

export type JsonScalar = string | number | boolean | null;
export type JsonValue = JsonScalar | JsonValue[] | { [ key: string ]: JsonValue };
export type DataModel = { [ key: string ]: JsonValue };
export type EditableValue = string | string[];

export interface ActionEvent {
	name: string;
	values: Record< string, EditableValue >;
}

export interface ColumnComponent {
	id: string;
	type: 'Column';
	children: string[];
}

export interface RowComponent {
	id: string;
	type: 'Row';
	children: string[];
}

export type TextComponent = {
	id: string;
	type: 'Text';
	content: { text: string } | { path: string };
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
	disabled?: boolean;
	loading?: boolean;
}

export interface TextFieldComponent {
	id: string;
	type: 'TextField';
	label: string;
	path: string;
	inputMode: 'shortText' | 'longText';
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	validationMessage?: string;
}

export interface ChoicePickerComponent {
	id: string;
	type: 'ChoicePicker';
	label: string;
	path: string;
	mode: 'single' | 'multiple';
	options: { value: string; label: string }[];
	disabled?: boolean;
}

export type Component =
	| ColumnComponent
	| RowComponent
	| TextComponent
	| ButtonComponent
	| TextFieldComponent
	| ChoicePickerComponent;

export interface Surface {
	protocol: 'minimal-ai-ui/0.1';
	rootId: string;
	components: Record< string, Component >;
	data: DataModel;
}

export interface ComponentResult {
	protocol: 'agent-component/0.1';
	component: string;
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
	event: ActionEvent;
}

export interface ComponentOpening {
	protocol: 'agent-component/0.1';
	result: ComponentResult;
	allowedActions: string[];
	actionBindings: Record< string, string[] >;
	expiresAt: string;
}

export type ComponentStatePayload =
	| {
			state: 'awaiting-input';
			instanceId: string;
			revision: number;
			result: ComponentResult;
			allowedActions: string[];
			actionBindings: Record< string, string[] >;
			expiresAt: string;
	  }
	| {
			state: 'completed';
			instanceId: string;
			revision: number;
			result: ComponentResult;
			allowedActions: [];
			expiresAt: string;
	  }
	| {
			state: 'expired' | 'not-found' | 'temporarily-unavailable';
			reason:
				| 'INSTANCE_EXPIRED'
				| 'INSTANCE_UNAVAILABLE'
				| 'STATE_UNAVAILABLE'
				| 'ROLLOUT_DISABLED'
				| 'INVALID_STORED_RESULT'
				| 'DISCLOSURE_DENIED';
			instanceId: string;
			allowedActions: [];
			summary: string;
	  };

export type WireComponentCurrentState = {
	protocol: 'agent-component/0.1';
	resolvedLocale: string;
	request:
		| {
				state: 'settled';
				requestId: string;
				outcome: 'applied' | 'failed' | 'invalid-input' | 'rejected';
				revision: number;
		  }
		| { state: 'unknown'; requestId: string };
} & ComponentStatePayload;

export interface ComponentActionResponse {
	protocol: 'agent-component/0.1';
	requestId: string;
	outcome:
		| 'applied'
		| 'failed'
		| 'invalid-input'
		| 'stale'
		| 'request-conflict'
		| 'rejected'
		| 'indeterminate';
	current: WireComponentCurrentState;
}
