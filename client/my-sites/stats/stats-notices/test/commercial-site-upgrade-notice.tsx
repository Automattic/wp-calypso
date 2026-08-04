/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import CommercialSiteUpgradeNotice from '../commercial-site-upgrade-notice';

jest.mock( 'calypso/state', () => ( {
	useSelector: () => false,
} ) );

jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation', () => ( {
	__esModule: true,
	default: () => ( { mutateAsync: jest.fn() } ),
} ) );

jest.mock( 'calypso/my-sites/stats/hooks/use-plan-usage-query', () => ( {
	__esModule: true,
	default: () => ( { data: { upgrade_deadline_date: '2026-07-21' } } ),
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );

const renderNotice = ( showPaywallNotice: boolean ) =>
	render(
		<CommercialSiteUpgradeNotice
			siteId={ 123 }
			isOdysseyStats={ false }
			showPaywallNotice={ showPaywallNotice }
		/>
	);

describe( 'CommercialSiteUpgradeNotice', () => {
	// This is the user-visible half of the kill switch: `shouldShowPaywallNotice` returning false
	// is only useful because it lands the component on the dismissible variant.
	it( 'renders a dismissible upgrade prompt when the paywall is not in effect', () => {
		const { container } = renderNotice( false );

		expect( screen.getByRole( 'button', { name: 'close' } ) ).toBeVisible();
		expect( screen.getByText( 'Do you love Jetpack Stats?' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Upgrade to unlock UTM tracking, device stats, and region and city locations, and get priority support.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Upgrade my Stats' } ) ).toBeVisible();
		expect( container.querySelector( '.is-error' ) ).toBeNull();
	} );

	it( 'renders a non-dismissible lockout banner when the paywall is in effect', () => {
		const { container } = renderNotice( true );

		expect( screen.queryByRole( 'button', { name: 'close' } ) ).toBeNull();
		expect(
			screen.getByText(
				'You need to upgrade to a commercial license to continue using Jetpack Stats'
			)
		).toBeVisible();
		expect( container.querySelector( '.is-error' ) ).not.toBeNull();
	} );

	it( 'only names an upgrade deadline while the paywall is in effect', () => {
		renderNotice( true );
		expect( screen.getByText( '2026-07-21' ) ).toBeVisible();

		renderNotice( false );
		expect( screen.queryAllByText( '2026-07-21' ) ).toHaveLength( 1 );
	} );
} );
