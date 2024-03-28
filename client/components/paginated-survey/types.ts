export type Survey = {
	key: string;
	title: string;
};

export enum QuestionType {
	SINGLE_CHOICE = 'single',
	MULTIPLE_CHOICE = 'multiple',
}

export type Option = {
	label: string;
	helpText?: string;
	value: string;
};

export type Question = {
	key: string;
	headerText: string;
	subHeaderText: string;
	type: QuestionType;
	options: Option[];
};

export type Answer = {
	questionKey: string;
	value: string[];
};
