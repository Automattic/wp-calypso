import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { SubmitNpsSurveyResponse } from '../../types';
import useSubmitNpsSurveyMutation from '../use-submit-nps-survey-mutation';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const queryClient = new QueryClient();
const wrapper = ( { children } ) => (
	<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
);

// TODO
// Cover the failing cases
describe( 'useSubmitNpsSurveyMutation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'successfully submit the score', async () => {
		( wpcomRequest as jest.Mock ).mockImplementation( (): Promise< SubmitNpsSurveyResponse > => {
			return Promise.resolve( {
				result: true,
			} );
		} );

		const { result } = renderHook( () => useSubmitNpsSurveyMutation( 'test-survey' ), { wrapper } );

		result.current.mutate( { score: 10, feedback: 'profit!' } );

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data ).toEqual( {
				result: true,
			} );
		} );
	} );
} );
