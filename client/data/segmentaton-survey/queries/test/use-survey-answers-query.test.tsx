/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import useSurveyAnswersQuery from '../use-survey-answers-query';

const mockResponse = [
	{
		question_key: 'question_key_1',
		answer_keys: [ 'answer_key_1', 'answer_key_2' ],
	},
	{
		question_key: 'question_key_2',
		answer_keys: [ 'answer_key_3' ],
	},
];

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

describe( 'useSurveyAnswersQuery', () => {
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

		const { result } = renderHook( () => useSurveyAnswersQuery( { surveyKey: 'test_key' } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/segmentation-survey/answers?survey_key=test_key',
		} );
	} );

	it( 'should return expected data when successful', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( mockResponse );

		const { result } = renderHook( () => useSurveyAnswersQuery( { surveyKey: 'test_key' } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( {
			question_key_1: [ 'answer_key_1', 'answer_key_2' ],
			question_key_2: [ 'answer_key_3' ],
		} );
	} );
} );
