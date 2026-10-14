/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import { useDispatch } from '@wordpress/data';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { waitForPluginsActive } from 'calypso/landing/stepper/utils/wait-for-plugins-active';
import WaitForCommerceAtomic from '..';

jest.mock( '@automattic/onboarding', () => ( {
	Step: { Loading: () => null },
} ) );
jest.mock( '@wordpress/data', () => ( { useDispatch: jest.fn() } ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( { SITE_STORE: 'SITE_STORE' } ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( { useQuery: jest.fn() } ) );
jest.mock( 'calypso/landing/stepper/utils/wait-for-plugins-active', () => ( {
	waitForPluginsActive: jest.fn(),
} ) );

describe( 'WaitForCommerceAtomic', () => {
	const submit = jest.fn();
	const setSiteSetupError = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		( useQuery as jest.Mock ).mockReturnValue( new URLSearchParams( { siteId: '123' } ) );
		( useDispatch as jest.Mock ).mockReturnValue( { setSiteSetupError } );
	} );

	it( 'continues only after WooCommerce is active on the Atomic site', async () => {
		let finishWait: () => void = () => {};
		( waitForPluginsActive as jest.Mock ).mockReturnValue(
			new Promise< void >( ( resolve ) => {
				finishWait = resolve;
			} )
		);

		render(
			<WaitForCommerceAtomic
				flow="ai-site-builder-onboarding"
				stepName="wait-for-commerce-atomic"
				navigation={ { submit } }
			/>
		);

		expect( waitForPluginsActive ).toHaveBeenCalledWith( 123, [ 'woocommerce' ] );
		expect( submit ).not.toHaveBeenCalled();
		finishWait();
		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { ready: true } ) );
	} );

	it( 'sends a failed readiness check to the error step', async () => {
		( waitForPluginsActive as jest.Mock ).mockRejectedValue( new Error( 'timed out' ) );

		render(
			<WaitForCommerceAtomic
				flow="ai-site-builder-onboarding"
				stepName="wait-for-commerce-atomic"
				navigation={ { submit } }
			/>
		);

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { ready: false } ) );
		expect( setSiteSetupError ).toHaveBeenCalledWith(
			'commerce_atomic_wait_failed',
			'Error: timed out'
		);
	} );
} );
