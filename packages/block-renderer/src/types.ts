export type RenderedStyle = {
	css: string;
	isGlobalStyles: boolean;
	__unstableType?: string;
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
