export interface Color {
	color: string;
	name: string;
	slug: string;
}

export interface FontFamily {
	fontFamily: string;
	name: string;
	slug: string;
}

export interface Typography {
	fontFamily?: string;
	fontSize?: string;
	fontStyle?: string;
	fontWeight?: string;
	lineHeight?: string;
}

export type SetConfig = ( callback: ( config: GlobalStylesObject ) => GlobalStylesObject ) => void;

export interface GlobalStylesContext {
	user: GlobalStylesObject;
	base?: GlobalStylesObject;
	merged?: GlobalStylesObject;
	setUserConfig?: SetConfig;
	inline_css?: string;
	isReady: boolean;
}

export interface GlobalStylesObject {
	id?: number;
	slug?: string;
	title?: string;
	inline_css?: string;
	settings: {
		color?: {
			palette: {
				theme: Color[];
			};
		};
	};
	styles: {
		elements?: {
			heading: {
				typography: Typography;
			};
		};
		typography?: Typography;
	};
}

export enum GlobalStylesVariationType {
	Free = 'free',
	Premium = 'premium',
}
