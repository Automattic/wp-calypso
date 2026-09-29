/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useIsEligibleForOneClickCheckout } from 'calypso/my-sites/checkout/purchase-modal/use-is-eligible-for-one-click-checkout';
import { renderWithProvider } from '../../../../test-helpers/testing-library';
import PaymentsUpgradeCard from '../payments-upgrade-card';

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => jest.fn() );

jest.mock(
	'calypso/my-sites/checkout/purchase-modal/use-is-eligible-for-one-click-checkout',
	() => ( { useIsEligibleForOneClickCheckout: jest.fn() } )
);

jest.mock( 'calypso/blocks/upsell-nudge/purchase-modal-wrapper', () => ( {
	__esModule: true,
	default: ( { plan, siteSlug }: { plan: string; siteSlug: string } ) => (
		<div role="dialog">{ `Purchase ${ plan } for ${ siteSlug }` }</div>
	),
} ) );

const mockedIsJetpackCloud = isJetpackCloud as jest.MockedFunction< typeof isJetpackCloud >;
const mockedUseIsEligible = useIsEligibleForOneClickCheckout as jest.MockedFunction<
	typeof useIsEligibleForOneClickCheckout
>;

const siteSlug = 'example.wordpress.com';
const paymentsPath = `/earn/payments/${ siteSlug }`;

const renderCard = ( sitePlanSlug?: string ) =>
	renderWithProvider( <PaymentsUpgradeCard siteSlug={ siteSlug } sitePlanSlug={ sitePlanSlug } /> );

const eligibilityLoaded = () => waitFor( () => expect( mockedUseIsEligible ).toHaveBeenCalled() );

const getLinkUrl = ( name: string ) =>
	new URL(
		screen.getByRole( 'link', { name } ).getAttribute( 'href' ) ?? '',
		window.location.origin
	);

describe( 'PaymentsUpgradeCard', () => {
	beforeEach( () => {
		mockedIsJetpackCloud.mockReturnValue( false );
		mockedUseIsEligible.mockReturnValue( { isLoading: false, result: false } );
		window.history.pushState( {}, '', paymentsPath );
	} );

	test( 'opens the purchase modal in place when the user can check out in one click', async () => {
		mockedUseIsEligible.mockReturnValue( { isLoading: false, result: true } );
		renderCard( 'free_plan' );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Upgrade to Premium' } ) );

		expect( await screen.findByRole( 'dialog' ) ).toHaveTextContent(
			`Purchase value_bundle for ${ siteSlug }`
		);
		expect( window.location.pathname ).toBe( paymentsPath );
	} );

	// Most sites behind the upsell have never bought anything, so they have no
	// saved card and this is the path they take.
	test( 'links to checkout for Premium, returning to the payments page either way', async () => {
		renderCard( 'free_plan' );

		// The card renders before the eligibility check has loaded.
		const url = getLinkUrl( 'Upgrade to Premium' );
		expect( url.pathname ).toBe( `/checkout/${ siteSlug }/value_bundle` );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( paymentsPath );
		expect( url.searchParams.get( 'cancel_to' ) ).toBe( paymentsPath );

		await eligibilityLoaded();
		expect( screen.getByRole( 'link', { name: 'Upgrade to Premium' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Upgrade to Premium' } )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the billing term of the current plan', async () => {
		renderCard( 'personal-bundle-monthly' );
		await eligibilityLoaded();

		expect( getLinkUrl( 'Upgrade to Premium' ).pathname ).toBe(
			`/checkout/${ siteSlug }/value_bundle_monthly`
		);
	} );

	test.each( [
		[ 'a plan that is not a WordPress.com plan', 'jetpack_free' ],
		[ 'a plan Premium is not an upgrade from', 'business-bundle' ],
		[ 'a site with no plan loaded', undefined ],
	] )( 'links to the plans page for %s', ( _, sitePlanSlug ) => {
		mockedUseIsEligible.mockReturnValue( { isLoading: false, result: true } );
		renderCard( sitePlanSlug );

		const url = getLinkUrl( 'Upgrade' );
		expect( url.pathname ).toBe( `/plans/${ siteSlug }` );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( paymentsPath );
	} );

	test( 'links to the plans page in Jetpack Cloud', () => {
		mockedIsJetpackCloud.mockReturnValue( true );
		mockedUseIsEligible.mockReturnValue( { isLoading: false, result: true } );
		renderCard( 'free_plan' );

		expect( getLinkUrl( 'Upgrade' ).pathname ).toBe( `/plans/${ siteSlug }` );
	} );
} );
