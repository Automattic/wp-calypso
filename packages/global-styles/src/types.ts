export interface Color {
	color: string;
	name: string;
	slug: string;
}

export interface GlobalStylesObject {
	id?: number;
	title?: string;
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
