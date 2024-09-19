export type BlockRendererSettings = {
	[ key: string ]: any;
};

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
	scripts: string;
};

export type RenderedContent = {
	html: string;
	styles: RenderedStyle[];
	scripts: string;
};

export type RenderedPatterns = {
	[ key: string ]: RenderedPattern;
};

export type SiteInfo = {
	title?: string;
	tagline?: string;
};
