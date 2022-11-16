export type Location = {
	pathname: string;
	search?: string;
	hash?: string;
	state?: unknown;
	key?: string;
};

export type ExtraFields = Record< string, string >;
