export type PreviewProps = {
	url: string;
	title: string;
	description?: string;
	customText?: string;
	image?: string;
};

export type TextFormatter = ( text: string ) => string;
