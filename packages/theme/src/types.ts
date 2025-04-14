export type ThemeProps = {
	color: {
		primary: string;
		fun?: number;
		scheme?: 'dark' | 'light';
	};
	children?: React.ReactNode;
};

type ArrayOf12< T > = [ T, T, T, T, T, T, T, T, T, T, T, T ];

export type ColorScale = ArrayOf12< string >;

export type ColorBaseTokens = {
	'neutral-scale': ColorScale;
	'primary-scale': ColorScale;
};
