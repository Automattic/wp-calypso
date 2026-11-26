/**
 * @vitest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import { recordSignupComplete } from 'calypso/lib/analytics/signup';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupCompleteFlowName,
	getSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import SiteMigrationCheckoutReturn from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

vi.mock( 'calypso/landing/stepper/hooks/use-site', () => ( { useSiteQuery: vi.fn() } ) );
vi.mock( 'calypso/lib/wp', () =>
	( ( m ) => ( { ...m, default: m } ) )( { req: { post: vi.fn().mockResolvedValue( {} ) } } )
);
vi.mock( 'calypso/lib/analytics/signup', () => ( {
	recordSignupComplete: vi.fn(),
	SIGNUP_DOMAIN_ORIGIN: { NOT_SET: 'not-set' },
} ) );
vi.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupCompleteFlowName: vi.fn(),
	clearSignupDestinationCookie: vi.fn(),
	getSignupCompleteFlowName: vi.fn(),
	getSignupIsNewUserAndClear: vi.fn(),
} ) );

describe( 'SiteMigrationCheckoutReturn', () => {
	const render = ( query = 'siteId=456&from=https%3A%2F%2Fexample.com&platform=wordpress' ) => {
		const submit = vi.fn();
		renderStep(
			<SiteMigrationCheckoutReturn { ...mockStepProps( { navigation: { submit } } ) } />,
			{
				initialEntry: `/site-migration-checkout-return?${ query }`,
			}
		);
		return submit;
	};

	beforeEach( () => {
		vi.clearAllMocks();
		vi.mocked( useSiteQuery ).mockReturnValue( {
			data: { ID: 456, slug: 'new-site.wordpress.com', plan: { product_slug: 'personal-bundle' } },
			isError: false,
		} as unknown as ReturnType< typeof useSiteQuery > );
	} );

	it( 'sets the new site up for the migration on the return from this tab’s checkout', async () => {
		vi.mocked( getSignupCompleteFlowName ).mockReturnValue( 'site-migration' );
		const submit = render();
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( {
				action: 'configure',
				siteId: 456,
				siteSlug: 'new-site.wordpress.com',
			} )
		);
		expect( clearSignupCompleteFlowName ).toHaveBeenCalled();
		expect( recordSignupComplete ).toHaveBeenCalledWith(
			expect.objectContaining( {
				flow: 'site-migration',
				siteId: 456,
				hasCartItems: true,
				planProductSlug: 'personal-bundle',
			} ),
			true
		);
		expect( wpcom.req.post ).toHaveBeenCalledWith(
			{ path: '/sites/456/site-intent', apiNamespace: 'wpcom/v2' },
			{},
			{ site_intent: 'site-migration' }
		);
		expect( submit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'only moves on to the site on any other visit', () => {
		vi.mocked( getSignupCompleteFlowName ).mockReturnValue( 'onboarding' );
		const submit = render();
		expect( submit ).toHaveBeenCalledWith( {
			action: 'continue',
			siteId: 456,
			siteSlug: 'new-site.wordpress.com',
		} );
		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( clearSignupCompleteFlowName ).not.toHaveBeenCalled();
		expect( recordSignupComplete ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'the site can’t be loaded', 'siteId=456', true ],
		[ 'checkout named no site', 'from=https%3A%2F%2Fexample.com', false ],
	] )( 'reports it when %s', ( _, query, isError ) => {
		vi.mocked( useSiteQuery ).mockReturnValue( {
			data: null,
			isError,
		} as unknown as ReturnType< typeof useSiteQuery > );
		const submit = render( query );
		expect( submit ).toHaveBeenCalledWith( { action: 'site-unavailable' } );
	} );
} );
