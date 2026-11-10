/**
 * @jest-environment jsdom
 */
import { DomainSubtype, type Domain } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import DomainOverviewSettings from '../settings';

jest.mock( '@automattic/calypso-support-session', () => ( {
	isSupportSession: jest.fn( () => false ),
} ) );

afterEach( () => {
	( isSupportSession as jest.Mock ).mockReturnValue( false );
} );

const connected = { subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' } };

const NAME_SERVERS = 'Name servers';
const DNS = 'DNS records';
const FORWARDING = 'Domain forwarding';
const SECURITY = 'Domain security';
const GLUE = 'Glue records';
const OPTIONAL_ROWS = [ NAME_SERVERS, DNS, FORWARDING, SECURITY, GLUE ];

function renderDomainSettings( customProps: Partial< Domain > = {}, isDisabled = false ) {
	const domain = {
		domain: 'example.com',
		blog_id: 123,
		site_slug: 'example.wordpress.com',
		can_manage_dns_records: true,
		current_user_can_manage: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} as Domain;

	return render(
		<DomainOverviewSettings
			domain={ domain }
			domainDiagnostics={ undefined }
			isDisabled={ isDisabled }
		/>
	);
}

async function getOptionalRows() {
	await screen.findByText( 'Site' );
	expect( screen.getByText( 'Professional email' ) ).toBeVisible();

	return OPTIONAL_ROWS.filter( ( row ) => screen.queryByText( row ) );
}

describe( 'DomainOverviewSettings', () => {
	test.each< [ string, Partial< Domain >, string[] ] >( [
		[ 'a fully manageable registered domain', {}, OPTIONAL_ROWS ],
		[
			'a gravatar restricted domain',
			{ is_gravatar_restricted_domain: true },
			[ DNS, FORWARDING, SECURITY, GLUE ],
		],
		[
			'a domain whose DNS cannot be managed',
			{ can_manage_dns_records: false },
			[ NAME_SERVERS, SECURITY ],
		],
		[
			'a user who cannot manage the domain',
			{ current_user_can_manage: false },
			[ NAME_SERVERS, DNS, FORWARDING, SECURITY ],
		],
		[ 'a connected domain', connected, [ DNS, FORWARDING, SECURITY ] ],
		[
			'a connected domain whose DNS cannot be managed',
			{ ...connected, can_manage_dns_records: false },
			[ SECURITY ],
		],
	] )( 'shows the right rows for %s', async ( _, customProps, expected ) => {
		renderDomainSettings( customProps );

		expect( await getOptionalRows() ).toEqual( expected );
	} );

	test( 'shows glue records in a support session even when the user cannot manage', async () => {
		( isSupportSession as jest.Mock ).mockReturnValue( true );
		renderDomainSettings( { current_user_can_manage: false } );

		expect( await screen.findByText( GLUE ) ).toBeVisible();
	} );

	describe( 'when eligible for inbound transfer', () => {
		const eligible = { ...connected, is_eligible_for_inbound_transfer: true };
		const name = 'Bring your domain to WordPress.com Manage your site and domain all in one place.';

		test( 'links to the transfer flow and tracks the click', async () => {
			const { recordTracksEvent } = renderDomainSettings( eligible );

			const row = await screen.findByRole( 'link', { name } );
			const { pathname, searchParams } = new URL( row.getAttribute( 'href' )! );
			expect( pathname ).toBe( '/setup/domain/use-my-domain' );
			expect( searchParams.get( 'initialQuery' ) ).toBe( 'example.com' );
			expect( searchParams.get( 'initialMode' ) ).toBe( 'transfer-domain' );
			expect( searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
			expect( searchParams.get( 'dashboard' ) ).toBeTruthy();
			expect( searchParams.get( 'back_to' ) ).toBeTruthy();

			await userEvent.click( row );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_domain_overview_item_click',
				{ item: 'transfer-in', subtype: DomainSubtype.DOMAIN_CONNECTION, domain: 'example.com' }
			);
		} );

		test( 'is disabled when the overview is disabled', async () => {
			renderDomainSettings( eligible, true );

			expect( await screen.findByRole( 'button', { name } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
		} );
	} );

	test( 'keeps only Site, Emails and Security for a partially restricted domain', async () => {
		renderDomainSettings( {
			current_user_can_manage: false,
			can_manage_dns_records: false,
			is_gravatar_restricted_domain: true,
		} );

		expect( await getOptionalRows() ).toEqual( [ SECURITY ] );
		expect( screen.getAllByRole( 'link' ) ).toHaveLength( 2 );
	} );
} );
