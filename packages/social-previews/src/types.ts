export type PreviewProps = {
	url: string;
	title: string;
	description?: string;
	customText?: string;
	image?: string;
	headingsLevel?: number;
};

export type TextFormatter = ( text: string ) => string;
