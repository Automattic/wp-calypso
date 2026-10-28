/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignLicense from '..';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-router', () => {
	const mockPage = Object.assign( jest.fn(), { redirect: jest.fn() } );
	return { __esModule: true, default: mockPage };
} );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/analytics/actions', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/state/a8c-for-agencies/agency/selectors', () => ( {
	getActiveAgencyId: () => 42,
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: () => ( { display_name: 'agency' } ),
} ) );

jest.mock( 'calypso/a8c-for-agencies/components/a4a-feedback/hooks/use-show-a4a-feedback', () =>
	jest.fn( () => ( { isFeedbackShown: true } ) )
);
jest.mock( 'calypso/data/agency-dashboard/use-fetch-dashboard-sites', () =>
	jest.fn( () => ( {
		data: { sites: [ { blog_id: 1, url_with_scheme: 'https://example.com' } ], total: 1 },
		isError: false,
		isLoading: false,
	} ) )
);
jest.mock( '../../products-overview/hooks/use-assign-licenses-to-site', () =>
	jest.fn( () => ( {
		assignLicensesToSite: jest.fn().mockResolvedValue( { selectedProducts: [] } ),
		isPending: false,
	} ) )
);

const passthrough = ( { children }: { children?: ReactNode } ) => <>{ children }</>;
jest.mock( 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour', () => ( {
	LayoutWithGuidedTour: passthrough,
} ) );
jest.mock(
	'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification',
	() => passthrough
);
jest.mock( 'calypso/layout/hosting-dashboard/header', () => ( {
	__esModule: true,
	default: passthrough,
	LayoutHeaderActions: passthrough,
	LayoutHeaderSubtitle: passthrough,
	LayoutHeaderTitle: passthrough,
} ) );
jest.mock( 'calypso/layout/hosting-dashboard/body', () => passthrough );
jest.mock(
	'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation',
	() => () => null
);
jest.mock( '../../assign-license-step-progress', () => () => null );
jest.mock( 'calypso/components/search-card', () => () => null );
jest.mock( 'calypso/components/pagination', () => () => null );

function renderAt( url: string ) {
	window.history.replaceState( null, '', url );
	render( <AssignLicense initialPage={ 1 } initialSearch="" /> );
}

describe( 'AssignLicense', () => {
	beforeEach( () => {
		jest.mocked( page.redirect ).mockClear();
	} );

	it( 'returns to the referral after assigning a license opened from it', async () => {
		renderAt( '/marketplace/assign-license?key=jetpack-backup_abc&referral=7' );

		await userEvent.click( screen.getByText( 'https://example.com' ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Assign 1 License' } ) );

		await waitFor( () =>
			expect( page.redirect ).toHaveBeenCalledWith( '/referrals/dashboard?referral=7' )
		);
	} );

	it( 'returns to the referral when assigning later', async () => {
		renderAt( '/marketplace/assign-license?key=jetpack-backup_abc&referral=7' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Assign later' } ) );

		expect( page.redirect ).toHaveBeenCalledTimes( 1 );
		expect( page.redirect ).toHaveBeenCalledWith( '/referrals/dashboard?referral=7' );
	} );

	it( 'goes to Licenses after assigning a license not opened from a referral', async () => {
		renderAt( '/marketplace/assign-license?key=jetpack-backup_abc' );

		await userEvent.click( screen.getByText( 'https://example.com' ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Assign 1 License' } ) );

		await waitFor( () => expect( page.redirect ).toHaveBeenCalledWith( '/purchases/licenses' ) );
	} );
} );
