export type NavigatorScreenObject = {
	checked?: boolean;
	icon?: JSX.Element;
	label: string;
	path: string;
	title?: string;
	description?: string;
	hideBack?: boolean;
	content: JSX.Element;
	actionText: string;
	onSelect?: () => void;
	onSubmit?: () => void;
	onBack?: () => void;
};
