export type Survey = {
	key: string;
	questions: Question[];
};

export enum QuestionType {
	SINGLE_CHOICE = 'single_choice',
	MULTIPLE_CHOICE = 'multiple_choice',
}

export type Option = {
	label: string;
	helpText?: string;
	value: string;
	additionalProps?: Record< string, boolean >;
};

export type Question = {
	key: string;
	headerText: string;
	subHeaderText?: string;
	type: QuestionType;
	options: Option[];
};

export type Answers = Record< string, string[] >;

export type QuestionConfiguration = Record<
	string,
	{
		hideContinue?: boolean;
		hideSkip?: boolean;
		exitOnSkip?: boolean;
	}
>;
