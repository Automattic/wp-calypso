// import { translate } from 'i18n-calypso';
const translate = ( text: string ) => text; // Stubbed for now
import { Question, QuestionType } from 'calypso/components/paginated-survey/types';

export const questions: Question[] = [
	{
		headerText: translate( 'What is your favorite color?' ),
		key: 'favorite-color',
		subHeaderText: translate( 'This will help us personalize your experience.' ),
		type: QuestionType.SINGLE_CHOICE,
		options: [
			{
				label: translate( 'Red' ),
				value: 'red',
			},
			{
				label: translate( 'Blue' ),
				value: 'blue',
			},
			{
				label: translate( 'Green' ),
				value: 'green',
			},
		],
	},
	{
		headerText: translate( 'What is your favorite food?' ),
		key: 'favorite-food',
		subHeaderText: translate( 'This will help us personalize your experience.' ),
		type: QuestionType.SINGLE_CHOICE,
		options: [
			{
				label: translate( 'Pizza' ),
				value: 'pizza',
			},
			{
				label: translate( 'Burgers' ),
				value: 'burgers',
			},
			{
				label: translate( 'Salad' ),
				value: 'salad',
			},
		],
	},
	{
		headerText: translate( 'What is your favorite animal?' ),
		key: 'favorite-animal',
		subHeaderText: translate( 'This will help us personalize your experience.' ),
		type: QuestionType.SINGLE_CHOICE,
		options: [
			{
				label: translate( 'Dog' ),
				value: 'dog',
			},
			{
				label: translate( 'Cat' ),
				value: 'cat',
			},
			{
				label: translate( 'Bird' ),
				value: 'bird',
			},
		],
	},
];
