export type ThemeProps = {
	color: {
		primary: string;
		fun?: number;
		scheme?: 'dark' | 'light';
	};
	children?: React.ReactNode;
};
