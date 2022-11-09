export type PatternAssemblerPattern = {
	id: number;
	name: string;
	key?: string;
};

export type PatternAssemblerData = {
	header: PatternAssemblerPattern | null;
	sections: PatternAssemblerPattern[];
	footer: PatternAssemblerPattern | null;
};
