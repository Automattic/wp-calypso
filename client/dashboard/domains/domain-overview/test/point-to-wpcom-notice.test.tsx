/**
 * @jest-environment jsdom
 */
import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { domainQuery, queryClient } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PointToWpcomNotice from '../point-to-wpcom-notice';

const domainName = 'example.com';

const NOTICE_TITLE = 'Transfer completed';
const BUTTON_LABEL = 'Point to WordPress.com';
const OWNER = 'owner@example.com';

const getMockedDomainData = ( customProps: Partial< Domain > = {} ): Domain =>
	( {
		domain: domainName,
		owner: OWNER,
		current_user_is_owner: true,
		points_to_wpcom: false,
		transfer_status: DomainTransferStatus.COMPLETED,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} ) as Domain;

const interceptPointToWpcom = () =>
	nock( 'https://public-api.wordpress.com' ).post( '/wpcom/v2/domains/point-to-wpcom', ( body ) => {
		expect( body ).toEqual( { domain: domainName } );
		return true;
	} );

// The mutation invalidates the shared api-queries query client, so the
// interaction tests render against that same client to observe the effect.
const renderWithSharedClient = ( domain: Domain ) => {
	queryClient.setQueryData( domainQuery( domainName ).queryKey, domain );
	return render( <PointToWpcomNotice domain={ domain } />, { queryClient } );
};

const interceptDomainDetails = () =>
	nock( 'https://public-api.wordpress.com' ).get( `/rest/v1.2/domain-details/${ domainName }` );

// Mirrors how DomainOverview feeds the notice: the domain comes from the query,
// so a successful mutation is only visible once the refetch lands.
function PointToWpcomNoticeFromQuery() {
	const { data: domain } = useQuery( domainQuery( domainName ) );
	return domain ? <PointToWpcomNotice domain={ domain } /> : null;
}

const openDialog = async ( user: ReturnType< typeof userEvent.setup > ) => {
	await user.click( screen.getByRole( 'button', { name: BUTTON_LABEL } ) );
	return screen.findByRole( 'dialog' );
};

describe( '<PointToWpcomNotice>', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	test( 'renders the notice with the button for the owner', () => {
		render( <PointToWpcomNotice domain={ getMockedDomainData() } /> );

		expect( screen.getByText( NOTICE_TITLE ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: BUTTON_LABEL } ) ).toBeVisible();
		expect( screen.queryByText( OWNER ) ).not.toBeInTheDocument();
	} );

	test( 'renders the notice without the button for a non-owner', () => {
		render(
			<PointToWpcomNotice domain={ getMockedDomainData( { current_user_is_owner: false } ) } />
		);

		expect( screen.getByText( NOTICE_TITLE ) ).toBeVisible();
		expect( screen.getByText( OWNER ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: BUTTON_LABEL } ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when the domain points to WordPress.com', () => {
		render( <PointToWpcomNotice domain={ getMockedDomainData( { points_to_wpcom: true } ) } /> );

		expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when the domain has no transfer status', () => {
		render( <PointToWpcomNotice domain={ getMockedDomainData( { transfer_status: null } ) } /> );

		expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when the transfer is not completed', () => {
		render(
			<PointToWpcomNotice
				domain={ getMockedDomainData( { transfer_status: DomainTransferStatus.CANCELLED } ) }
			/>
		);

		expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when the domain is not a registration', () => {
		render(
			<PointToWpcomNotice
				domain={ getMockedDomainData( {
					subtype: { id: DomainSubtype.DOMAIN_TRANSFER, label: 'Domain Transfer' },
				} ) }
			/>
		);

		expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'confirming the dialog posts the domain and invalidates the domain query', async () => {
		const user = userEvent.setup();
		const scope = interceptPointToWpcom().reply( 200 );

		const { recordTracksEvent } = renderWithSharedClient( getMockedDomainData() );

		const dialog = await openDialog( user );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Continue' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_domains_point_to_wpcom', {
			domain_name: domainName,
		} );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_domains_point_to_wpcom_success',
				{ domain_name: domainName }
			);
		} );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( queryClient.getQueryState( domainQuery( domainName ).queryKey )?.isInvalidated ).toBe(
			true
		);
	} );

	test( 'keeps the button busy until the domain refetch lands, then hides the notice', async () => {
		const user = userEvent.setup();
		interceptDomainDetails().reply( 200, getMockedDomainData() );
		const postScope = interceptPointToWpcom().reply( 200 );
		const refetchScope = interceptDomainDetails()
			.delay( 500 )
			.reply( 200, getMockedDomainData( { points_to_wpcom: true } ) );

		render( <PointToWpcomNoticeFromQuery />, { queryClient } );

		const button = await screen.findByRole( 'button', { name: BUTTON_LABEL } );
		await user.click( button );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Continue' } ) );

		await waitFor( () => {
			expect( postScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( queryClient.isFetching( { queryKey: domainQuery( domainName ).queryKey } ) ).toBe(
				1
			);
		} );
		expect( button ).toBeDisabled();

		await waitFor( () => {
			expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
		} );
		expect( refetchScope.isDone() ).toBe( true );
	} );

	test( 'cancelling the dialog does not post the domain', async () => {
		const user = userEvent.setup();
		const scope = interceptPointToWpcom().reply( 200 );

		const { recordTracksEvent } = renderWithSharedClient( getMockedDomainData() );

		const dialog = await openDialog( user );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) );

		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
		expect( scope.isDone() ).toBe( false );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
		expect( screen.getByText( NOTICE_TITLE ) ).toBeVisible();
	} );

	test( 'records an error event and re-enables the button when the request fails', async () => {
		const user = userEvent.setup();
		const scope = interceptPointToWpcom().reply( 500, { message: 'Could not update nameservers' } );

		const { recordTracksEvent } = renderWithSharedClient( getMockedDomainData() );

		const dialog = await openDialog( user );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Continue' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_domains_point_to_wpcom_error',
				expect.objectContaining( { domain_name: domainName } )
			);
		} );

		expect( screen.getByRole( 'button', { name: BUTTON_LABEL } ) ).toBeEnabled();
		expect( queryClient.getQueryState( domainQuery( domainName ).queryKey )?.isInvalidated ).toBe(
			false
		);
	} );
} );
