/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import ContentInfo from '../content-info';
import SiteLeaveModal from '../index';
import type { Site } from '@automattic/api-core';

// The blocker-counting tests run against the Calypso backport branch because it
// builds plain string hrefs. The dashboard branch uses TanStack routes, and
// test-utils renders a bare root route, so those hrefs never resolve.
let mockIsBackport = true;

jest.mock( '../../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: () => mockIsBackport,
} ) );

const CURRENT_USER_ID = 1;
const OTHER_USER_ID = 2;

const site = {
	ID: 123,
	slug: 'example.wordpress.com',
	name: 'Example',
	site_owner: OTHER_USER_ID,
} as Site;

function mockPurchases( purchases: object[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( { site: site.ID } )
		.reply( 200, purchases );
}

function purchase( overrides: object = {} ) {
	return {
		ID: 555,
		user_id: CURRENT_USER_ID,
		product_slug: 'personal-bundle',
		is_refundable: false,
		...overrides,
	};
}

const renderContent = () => render( <ContentInfo site={ site } onClose={ jest.fn() } /> );

const findManagePurchases = () => screen.findByRole( 'link', { name: 'Manage purchases' } );

beforeEach( () => {
	mockIsBackport = true;
	window.scrollTo = jest.fn();
} );

describe( '<ContentInfo> purchase blockers', () => {
	test( 'links straight to the purchase when a single purchase blocks leaving', async () => {
		mockPurchases( [ purchase( { ID: 555 } ) ] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com/555'
		);
	} );

	test( 'links to the site purchase list when several purchases block leaving', async () => {
		mockPurchases( [ purchase( { ID: 555 } ), purchase( { ID: 556 } ) ] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com'
		);
	} );

	test( 'ignores non-refundable premium themes when counting blockers', async () => {
		mockPurchases( [
			purchase( { ID: 555 } ),
			purchase( { ID: 556, product_slug: 'premium_theme', is_refundable: false } ),
		] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com/555'
		);
	} );

	test( 'counts refundable premium themes as blockers', async () => {
		mockPurchases( [
			purchase( { ID: 555 } ),
			purchase( { ID: 556, product_slug: 'premium_theme', is_refundable: true } ),
		] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com'
		);
	} );

	test( 'ignores purchases belonging to other users when counting blockers', async () => {
		mockPurchases( [ purchase( { ID: 555 } ), purchase( { ID: 556, user_id: OTHER_USER_ID } ) ] );
		renderContent();

		expect( await findManagePurchases() ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com/555'
		);
	} );

	test( 'offers the leave form when nothing blocks leaving', async () => {
		mockPurchases( [ purchase( { ID: 556, user_id: OTHER_USER_ID } ) ] );
		renderContent();

		expect( await screen.findByRole( 'button', { name: 'Leave site' } ) ).toBeVisible();
		expect( screen.queryByText( /reassigned to the site owner/ ) ).not.toBeInTheDocument();
	} );

	test( 'explains who will receive authored content on an Atomic site', async () => {
		mockPurchases( [] );
		render( <ContentInfo site={ { ...site, is_wpcom_atomic: true } } onClose={ jest.fn() } /> );

		expect( await screen.findByText( /reassigned to the site owner/ ) ).toBeVisible();
	} );

	test( 'reports a failed leave if the dialog unmounts during the request', async () => {
		mockPurchases( [] );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wp/v2/sites/123/users/me' )
			.query( true )
			.reply( 200, { id: CURRENT_USER_ID } );
		let finishRequest: ( () => void ) | undefined;
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/123/users/1/delete' )
			.query( true )
			.reply( ( _uri, _body, callback ) => {
				finishRequest = () => callback( null, [ 200, { success: false } ] );
			} );
		const user = userEvent.setup();
		const onClose = jest.fn();
		const { unmount, recordTracksEvent } = render(
			<ContentInfo site={ site } onClose={ onClose } />
		);

		await user.click( await screen.findByRole( 'checkbox' ) );
		const submit = screen.getByRole( 'button', { name: 'Leave site' } );
		await waitFor( () => expect( submit ).toBeEnabled() );
		await user.click( submit );
		await waitFor( () => expect( finishRequest ).toBeDefined() );
		expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeDisabled();

		unmount();
		finishRequest?.();
		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_sites_dashboard_site_leave_modal_leave_site_error',
				{ site_id: site.ID, error: 'Error' }
			)
		);
		expect( onClose ).not.toHaveBeenCalled();
	} );

	test.each( [
		{ outcome: 'success', success: true, navigations: [ [ { to: '/sites' } ] ] },
		{ outcome: 'error', success: false, navigations: [] },
	] )(
		'completes a mounted $outcome after one leave request',
		async ( { success, navigations } ) => {
			mockIsBackport = false;
			mockPurchases( [] );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wp/v2/sites/123/users/me' )
				.query( true )
				.reply( 200, { id: CURRENT_USER_ID } );
			let finishRequest: ( () => void ) | undefined;
			let requestCount = 0;
			const leaveRequest = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/sites/123/users/1/delete' )
				.query( true )
				.reply( ( _uri, _body, callback ) => {
					requestCount++;
					finishRequest = () => callback( null, [ 200, { success } ] );
				} );
			const onClose = jest.fn();
			const { router } = render( <ContentInfo site={ site } onClose={ onClose } /> );
			const navigate = jest.spyOn( router, 'navigate' ).mockResolvedValue();
			const user = userEvent.setup();

			await user.click( await screen.findByRole( 'checkbox' ) );
			const submit = screen.getByRole( 'button', { name: 'Leave site' } );
			await waitFor( () => expect( submit ).toBeEnabled() );
			await user.dblClick( submit );
			await waitFor( () => expect( finishRequest ).toBeDefined() );
			expect( submit ).toBeDisabled();
			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeDisabled();
			expect( requestCount ).toBe( 1 );
			expect( leaveRequest.isDone() ).toBe( true );
			expect( navigate ).not.toHaveBeenCalled();
			expect( onClose ).not.toHaveBeenCalled();

			finishRequest?.();
			await waitFor( () => expect( onClose ).toHaveBeenCalledTimes( 1 ) );
			expect( navigate.mock.calls ).toEqual( navigations );
			expect( requestCount ).toBe( 1 );
		}
	);

	test.each( [
		{
			outcome: 'success',
			success: true,
			message: 'You have left example.wordpress.com successfully.',
		},
		{ outcome: 'error', success: false, message: 'Failed to leave the site. Please try again.' },
	] )(
		'shows the $outcome notice after the leave dialog is dismissed',
		async ( { success, message } ) => {
			mockIsBackport = false;
			mockPurchases( [] );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wp/v2/sites/123/users/me' )
				.query( true )
				.reply( 200, { id: CURRENT_USER_ID } );
			let finishRequest: ( () => void ) | undefined;
			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/sites/123/users/1/delete' )
				.query( true )
				.reply( ( _uri, _body, callback ) => {
					finishRequest = () => callback( null, [ 200, { success } ] );
				} );

			function LeaveDialog() {
				const [ isOpen, setIsOpen ] = useState( true );
				return (
					<>
						<Snackbars />
						{ isOpen && <SiteLeaveModal site={ site } onClose={ () => setIsOpen( false ) } /> }
					</>
				);
			}

			const user = userEvent.setup();
			const { router } = render( <LeaveDialog /> );
			const navigate = jest.spyOn( router, 'navigate' ).mockResolvedValue();
			await user.click( await screen.findByRole( 'checkbox' ) );
			const submit = screen.getByRole( 'button', { name: 'Leave site' } );
			await waitFor( () => expect( submit ).toBeEnabled() );
			await user.click( submit );
			await waitFor( () => expect( finishRequest ).toBeDefined() );

			await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
			expect( screen.queryByRole( 'dialog', { name: 'Leave site' } ) ).not.toBeInTheDocument();
			finishRequest?.();
			const notices = await screen.findAllByText( message );
			await waitFor( () =>
				expect(
					notices.find( ( notice ) => notice.closest( '.dashboard-snackbars' ) )
				).toBeVisible()
			);
			expect( navigate ).not.toHaveBeenCalled();
		}
	);

	describe( 'on the dashboard', () => {
		beforeEach( () => {
			mockIsBackport = false;
		} );

		test( 'drops the site filter when a single purchase blocks leaving', async () => {
			mockPurchases( [ purchase( { ID: 555 } ) ] );
			renderContent();

			expect( await findManagePurchases() ).not.toHaveAttribute(
				'href',
				expect.stringContaining( 'site=' )
			);
		} );

		test( 'keeps the site filter when several purchases block leaving', async () => {
			mockPurchases( [ purchase( { ID: 555 } ), purchase( { ID: 556 } ) ] );
			renderContent();

			expect( ( await findManagePurchases() ).getAttribute( 'href' ) ).toContain( 'site=123' );
		} );
	} );
} );
