export type ThemeProps = {
	color: {
		primary: string;
		info?: string;
		success?: string;
		warning?: string;
		error?: string;
		fun?: number;
		scheme?: 'dark' | 'light';
	};
	children?: React.ReactNode;
};

export type TokensObject = {
	[ key: string ]: string | string[] | TokensObject;
};
