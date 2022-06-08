/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSendEmailVerification } from '../use-send-email-verification';

describe( 'use-send-email-verification hook', () => {
	test( 'returns success from the api', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const expected = {
			success: true,
		};

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/send-verification-email' )
			.reply( 200, expected );

		const { result } = renderHook( () => useSendEmailVerification(), {
			wrapper,
		} );

		const sendEmailVerification = result.current;
		const data = await sendEmailVerification();

		expect( data ).toEqual( expected );
	} );
} );
