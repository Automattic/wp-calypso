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

export interface GlobalStylesObject {
	id?: number;
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
				typography: {
					fontFamily: string;
				};
			};
		};
		typography?: {
			fontFamily: string;
		};
	};
}
