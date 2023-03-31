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
