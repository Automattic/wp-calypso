/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QuestionType } from 'calypso/components/survey-container/types';
import wpcom from 'calypso/lib/wp';
import useSurveyStructureQuery from '../use-survey-structure-query';

const mockResponse = [
	{
		header_text: 'Question 1',
		key: 'question_key_1',
		sub_header_text: 'Subheader 1',
		type: 'single_choice',
		options: [
			{
				label: 'Option 1',
				value: 'answer_key_1',
				help_text: 'Help text 1',
			},
			{
				label: 'Option 2',
				value: 'answer_key_2',
				help_text: 'Help text 2',
			},
		],
	},
	{
		header_text: 'Question 2',
		key: 'question_key_2',
		sub_header_text: 'Subheader 2',
		type: 'multiple_choice',
		options: [
			{
				label: 'Option 3',
				value: 'answer_key_3',
				help_text: 'Help text 3',
			},
		],
	},
];

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

describe( 'useSurveyStructureQuery', () => {
	let queryClient: QueryClient;
	let wrapper: React.FC< React.PropsWithChildren< any > >;

	beforeEach( () => {
		jest.mocked( wpcom.req.get ).mockReset();

		queryClient = new QueryClient( {
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		} );

		wrapper = ( { children }: React.PropsWithChildren< any > ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should call wpcom.req.get with the right parameters', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( mockResponse );

		const { result } = renderHook( () => useSurveyStructureQuery( { surveyKey: 'test-key' } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/segmentation-survey/test-key',
		} );
	} );

	it( 'should return expected data when successful', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( mockResponse );

		const { result } = renderHook( () => useSurveyStructureQuery( { surveyKey: 'test-key' } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( [
			{
				headerText: 'Question 1',
				key: 'question_key_1',
				subHeaderText: 'Subheader 1',
				type: QuestionType.SINGLE_CHOICE,
				options: [
					{
						label: 'Option 1',
						value: 'answer_key_1',
						helpText: 'Help text 1',
					},
					{
						label: 'Option 2',
						value: 'answer_key_2',
						helpText: 'Help text 2',
					},
				],
			},
			{
				headerText: 'Question 2',
				key: 'question_key_2',
				subHeaderText: 'Subheader 2',
				type: QuestionType.MULTIPLE_CHOICE,
				options: [
					{
						label: 'Option 3',
						value: 'answer_key_3',
						helpText: 'Help text 3',
					},
				],
			},
		] );
	} );
} );
