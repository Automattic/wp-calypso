import { Question, QuestionType } from 'calypso/components/survey-container/types';

export const mockQuestions: Question[] = [
	{
		headerText: 'What is your favorite color?',
		key: 'favorite-color',
		subHeaderText: 'This will help us personalize your experience.',
		type: QuestionType.SINGLE_CHOICE,
		options: [
			{
				label: 'Red',
				value: 'red',
			},
			{
				label: 'Blue',
				value: 'blue',
			},
			{
				label: 'Green',
				value: 'green',
			},
		],
	},
	{
		headerText: 'What is your favorite food?',
		key: 'favorite-food',
		subHeaderText: 'This will help us personalize your experience.',
		type: QuestionType.SINGLE_CHOICE,
		options: [
			{
				label: 'Pizza',
				value: 'pizza',
			},
			{
				label: 'Burgers',
				value: 'burgers',
			},
			{
				label: 'Salad',
				value: 'salad',
			},
		],
	},
	{
		headerText: 'What is your favorite animal?',
		key: 'favorite-animal',
		subHeaderText: 'This will help us personalize your experience.',
		type: QuestionType.SINGLE_CHOICE,
		options: [
			{
				label: 'Dog',
				value: 'dog',
			},
			{
				label: 'Cat',
				value: 'cat',
			},
			{
				label: 'Bird',
				value: 'bird',
			},
		],
	},
];
