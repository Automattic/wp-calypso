export interface ThemeSupports {
	[ index: string ]: boolean;
}

export type ActiveTheme = {
	theme_supports: ThemeSupports;
};
