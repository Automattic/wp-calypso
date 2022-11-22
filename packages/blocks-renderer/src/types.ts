export type RenderedStyle = {
	css: string;
	isGlobalStyles: boolean;
};

export type RenderedPattern = {
	ID: number;
	title: string;
	html: string;
	styles: RenderedStyle[];
};

export type RenderedPatterns = {
	[ key: string ]: RenderedPattern;
};
