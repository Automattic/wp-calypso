import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { NpsEligibilityApiResponse } from '../../types';
import useCheckNpsSurveyEligibility from '../use-check-nps-survey-eligibility';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const queryClient = new QueryClient();
const wrapper = ( { children } ) => (
	<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
);

// TODO
// There are more cases can be covered here. e.g. non-eligible on success, a failed query, etc.
describe( 'use-check-nps-survey-eligibility', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'returns eligible on a successful query', async () => {
		( wpcomRequest as jest.Mock ).mockImplementation( (): Promise< NpsEligibilityApiResponse > => {
			return Promise.resolve( {
				display_survey: true,
				seconds_until_eligible: 0,
				has_available_concierge_sessions: false,
			} );
		} );

		const { result } = renderHook( () => useCheckNpsSurveyEligibility( 'test-survey-name' ), {
			wrapper,
		} );

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data ).toEqual( {
				displaySurvey: true,
				secondsUntilEligible: 0,
				hasAvailableConciergeSessions: false,
			} );
		} );
	} );
} );
