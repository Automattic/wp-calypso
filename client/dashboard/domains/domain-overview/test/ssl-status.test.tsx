/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import DomainOverviewSslStatus from '../ssl-status';

const mockHasEnTranslation = vi.fn( () => true );
vi.mock( '@automattic/i18n-utils', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/i18n-utils' ) >(
		'@automattic/i18n-utils'
	) ),
	useHasEnTranslation: () => mockHasEnTranslation,
} ) );

afterEach( () => mockHasEnTranslation.mockReturnValue( true ) );

const registered = { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' };

function renderStatus( props: object ) {
	const domain = {
		domain: 'example.com',
		subtype: registered,
		points_to_wpcom: true,
		...props,
	} as Domain;

	return render(
		<>
			<span>Rendered</span>
			<DomainOverviewSslStatus domain={ domain } />
		</>
	);
}

describe( 'DomainOverviewSslStatus', () => {
	test( 'shows the active badge without a link', async () => {
		renderStatus( { ssl_status: 'active' } );

		expect( await screen.findByText( 'SSL active' ) ).toBeVisible();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test.each( [
		[ 'pending', 'SSL pending' ],
		[ 'newly_registered', 'SSL pending' ],
		[ 'inactive', 'SSL disabled' ],
	] )( 'links %s certificates to the security page', async ( ssl_status, badge ) => {
		const { recordTracksEvent } = renderStatus( { ssl_status } );

		expect( await screen.findByText( badge ) ).toBeVisible();
		const link = screen.getByRole( 'link', { name: 'View SSL details' } );
		expect( link ).toHaveAttribute( 'href', '/domains/example.com/security' );

		await userEvent.click( link );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_domain_overview_item_click',
			expect.objectContaining( { item: 'ssl-status' } )
		);
	} );

	test.each( [
		[ 'pending', 'SSL Pending' ],
		[ 'inactive', 'SSL Disabled' ],
	] )(
		'falls back to the old %s copy until the new one is translated',
		async ( ssl_status, badge ) => {
			mockHasEnTranslation.mockReturnValue( false );
			renderStatus( { ssl_status } );

			expect( await screen.findByText( badge ) ).toBeVisible();
		}
	);

	test( 'keeps the badge but not the link during TLD maintenance', async () => {
		renderStatus( { ssl_status: 'inactive', tld_maintenance_end_time: 1 } );

		expect( await screen.findByText( 'SSL disabled' ) ).toBeVisible();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test.each( [
		[ 'a null status', { ssl_status: null } ],
		[ 'a domain not pointing here', { ssl_status: 'inactive', points_to_wpcom: false } ],
		[
			'a transfer',
			{
				ssl_status: 'active',
				subtype: { id: DomainSubtype.DOMAIN_TRANSFER, label: 'Domain Transfer' },
			},
		],
		[
			'a pending async transfer',
			{ ssl_status: 'active', transfer_status: DomainTransferStatus.PENDING_ASYNC },
		],
		[
			'a site redirect',
			{
				ssl_status: 'inactive',
				subtype: { id: DomainSubtype.SITE_REDIRECT, label: 'Site Redirect' },
			},
		],
		[ 'a pending registration', { ssl_status: 'inactive', pending_registration: true } ],
		[
			'a registration pending at the registry',
			{ ssl_status: 'inactive', pending_registration_at_registry: true },
		],
	] )( 'shows nothing for %s', async ( _, props ) => {
		renderStatus( props );

		await screen.findByText( 'Rendered' );
		expect( screen.queryByText( /SSL/ ) ).not.toBeInTheDocument();
	} );
} );
