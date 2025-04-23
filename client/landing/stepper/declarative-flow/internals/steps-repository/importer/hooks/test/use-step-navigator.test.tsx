/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useStepNavigator } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/importer/hooks/use-step-navigator';

describe( 'useStepNavigator', () => {
	let queryClient: QueryClient;
	let wrapper: any;

	const flow = 'test-flow';

	beforeEach( () => {
		queryClient = new QueryClient( {
			defaultOptions: {
				mutations: {
					retry: false,
				},
			},
		} );

		wrapper = ( { children }: React.PropsWithChildren< unknown > ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	it( 'should return default checkout url', async () => {
		const navigation = {
			submit: jest.fn(),
		};
		const { result } = renderHook( () => useStepNavigator( flow, navigation, null, null, null ), {
			wrapper,
		} );

		act( () => {
			result.current.goToCheckoutPage?.();
		} );

		await waitFor( () => {
			expect( navigation.submit ).toHaveBeenCalled();
		} );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			type: 'redirect',
			url: '/checkout/business?redirect_to=%2Fsetup%2Ftest-flow%2FimporterWordpress&cancel_to=%2Fsetup%2Ftest-flow%2FimporterWordpress',
		} );
	} );

	it( 'should use custom redirect_to', async () => {
		const navigation = {
			submit: jest.fn(),
		};
		const { result } = renderHook( () => useStepNavigator( flow, navigation, null, null, null ), {
			wrapper,
		} );

		act( () => {
			result.current.goToCheckoutPage?.( {
				redirect_to: '/custom-redirect',
			} );
		} );

		await waitFor( () => {
			expect( navigation.submit ).toHaveBeenCalled();
		} );

		expect( navigation.submit ).toHaveBeenCalledWith( {
			type: 'redirect',
			url: '/checkout/business?redirect_to=%2Fcustom-redirect&cancel_to=%2Fsetup%2Ftest-flow%2FimporterWordpress',
		} );
	} );
} );
