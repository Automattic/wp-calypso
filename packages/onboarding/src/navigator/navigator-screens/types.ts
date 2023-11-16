export type NavigatorScreenObject = {
	slug: string;
	checked?: boolean;
	icon?: JSX.Element;
	label: string;
	path: string;
	title?: string;
	description?: string;
	hideBack?: boolean;
	content: JSX.Element;
	actionText: string;
	onSelect?: ( slug: string ) => void;
	onSubmit?: ( slug: string ) => void;
	onBack?: ( slug: string ) => void;
};
