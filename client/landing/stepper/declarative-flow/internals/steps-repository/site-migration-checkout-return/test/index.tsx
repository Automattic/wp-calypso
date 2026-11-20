/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupCompleteFlowName,
	getSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import SiteMigrationCheckoutReturn from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( { useSiteQuery: jest.fn() } ) );
jest.mock( 'calypso/lib/wp', () => ( { req: { post: jest.fn().mockResolvedValue( {} ) } } ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	getSignupCompleteFlowName: jest.fn(),
} ) );

describe( 'SiteMigrationCheckoutReturn', () => {
	const render = ( query = 'siteId=456&from=https%3A%2F%2Fexample.com&platform=wordpress' ) => {
		const submit = jest.fn();
		renderStep(
			<SiteMigrationCheckoutReturn { ...mockStepProps( { navigation: { submit } } ) } />,
			{
				initialEntry: `/site-migration-checkout-return?${ query }`,
			}
		);
		return submit;
	};

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useSiteQuery ).mockReturnValue( {
			data: { ID: 456, slug: 'new-site.wordpress.com' },
			isError: false,
		} as unknown as ReturnType< typeof useSiteQuery > );
	} );

	it( 'sets the new site up for the migration on the return from this tab’s checkout', async () => {
		jest.mocked( getSignupCompleteFlowName ).mockReturnValue( 'site-migration' );
		const submit = render();
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( {
				action: 'configure',
				siteId: 456,
				siteSlug: 'new-site.wordpress.com',
			} )
		);
		expect( clearSignupCompleteFlowName ).toHaveBeenCalled();
		expect( wpcom.req.post ).toHaveBeenCalledWith(
			{ path: '/sites/456/site-intent', apiNamespace: 'wpcom/v2' },
			{},
			{ site_intent: 'site-migration' }
		);
		expect( submit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'only moves on to the site on any other visit', () => {
		jest.mocked( getSignupCompleteFlowName ).mockReturnValue( 'onboarding' );
		const submit = render();
		expect( submit ).toHaveBeenCalledWith( {
			action: 'continue',
			siteId: 456,
			siteSlug: 'new-site.wordpress.com',
		} );
		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( clearSignupCompleteFlowName ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'the site can’t be loaded', 'siteId=456', true ],
		[ 'checkout named no site', 'from=https%3A%2F%2Fexample.com', false ],
	] )( 'reports it when %s', ( _, query, isError ) => {
		jest.mocked( useSiteQuery ).mockReturnValue( {
			data: null,
			isError,
		} as unknown as ReturnType< typeof useSiteQuery > );
		const submit = render( query );
		expect( submit ).toHaveBeenCalledWith( { action: 'site-unavailable' } );
	} );
} );
