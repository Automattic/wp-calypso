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
};

export type Question = {
	key: string;
	headerText: string;
	subHeaderText?: string;
	type: QuestionType;
	options: Option[];
	required: boolean;
};

export type Answers = Record< string, string[] >;
