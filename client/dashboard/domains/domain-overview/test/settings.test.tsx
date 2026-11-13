/**
 * @vitest-environment jsdom
 */
import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { type Mock, vi } from 'vitest';
import { render } from '../../../test-utils';
import DomainOverviewSettings from '../settings';

vi.mock( '@automattic/calypso-support-session', () => ( {
	isSupportSession: vi.fn( () => false ),
} ) );

afterEach( () => {
	( isSupportSession as Mock ).mockReturnValue( false );
	window.sessionStorage.clear();
} );

const connected = { subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Domain Connection' } };

const NAME_SERVERS = 'Name servers';
const DNS = 'DNS records';
const FORWARDING = 'Domain forwarding';
const SECURITY = 'DNSSEC';
const CONNECTED_SECURITY = 'Domain security';
const GLUE = 'Glue records';
const OPTIONAL_ROWS = [ NAME_SERVERS, DNS, FORWARDING, SECURITY, CONNECTED_SECURITY, GLUE ];
const SHOW_ADVANCED = { name: 'Show advanced settings' };

function getDomain( customProps: Partial< Domain > = {} ) {
	return {
		domain: 'example.com',
		blog_id: 123,
		site_slug: 'example.wordpress.com',
		can_manage_dns_records: true,
		current_user_can_manage: true,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} as Domain;
}

function renderDomainSettings( customProps: Partial< Domain > = {}, isDisabled = false ) {
	return render(
		<DomainOverviewSettings
			domain={ getDomain( customProps ) }
			domainDiagnostics={ undefined }
			isDisabled={ isDisabled }
		/>
	);
}

async function showAdvanced() {
	await userEvent.click( await screen.findByRole( 'button', SHOW_ADVANCED ) );
}

async function getOptionalRows() {
	await showAdvanced();
	await screen.findByText( 'Site' );
	expect( screen.getByText( 'Professional email' ) ).toBeVisible();

	return OPTIONAL_ROWS.filter( ( row ) => screen.queryByText( row ) );
}

describe( 'DomainOverviewSettings', () => {
	test.each< [ string, Partial< Domain >, string[] ] >( [
		[
			'a fully manageable registered domain',
			{},
			[ NAME_SERVERS, DNS, FORWARDING, SECURITY, GLUE ],
		],
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
		[ 'a connected domain', connected, [ DNS, FORWARDING, CONNECTED_SECURITY ] ],
		[
			'a connected domain whose DNS cannot be managed',
			{ ...connected, can_manage_dns_records: false },
			[ CONNECTED_SECURITY ],
		],
	] )( 'shows the right rows for %s', async ( _, customProps, expected ) => {
		renderDomainSettings( customProps );

		expect( await getOptionalRows() ).toEqual( expected );
	} );

	test( 'shows glue records in a support session even when the user cannot manage', async () => {
		( isSupportSession as Mock ).mockReturnValue( true );
		renderDomainSettings( { current_user_can_manage: false } );
		await showAdvanced();

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

	test( 'keeps only Site, Professional email and DNSSEC for a partially restricted domain', async () => {
		renderDomainSettings( {
			current_user_can_manage: false,
			can_manage_dns_records: false,
			is_gravatar_restricted_domain: true,
		} );

		expect( await getOptionalRows() ).toEqual( [ SECURITY ] );
		expect( screen.getAllByRole( 'link' ) ).toHaveLength( 2 );
	} );

	test( 'keeps security and glue records behind a tracked toggle, after the default rows', async () => {
		const { recordTracksEvent } = renderDomainSettings();
		const trackedToggle = ( expanded: boolean ) =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_domain_overview_item_click',
				expect.objectContaining( { item: 'advanced-toggle', expanded } )
			);

		const visibleRows = () =>
			screen
				.getAllByText( new RegExp( `^(${ OPTIONAL_ROWS.join( '|' ) })$` ) )
				.map( ( row ) => row.textContent );
		const defaultRows = [ FORWARDING, NAME_SERVERS, DNS ];

		await screen.findByText( DNS );
		expect( visibleRows() ).toEqual( defaultRows );

		await showAdvanced();
		await screen.findByText( SECURITY );
		expect( visibleRows() ).toEqual( [ ...defaultRows, SECURITY, GLUE ] );
		trackedToggle( true );

		await userEvent.click( screen.getByRole( 'button', { name: 'Hide advanced settings' } ) );
		expect( visibleRows() ).toEqual( defaultRows );
		trackedToggle( false );
	} );

	test( 'keeps the advanced rows open after the settings remount', async () => {
		const { unmount } = renderDomainSettings();
		await showAdvanced();
		await screen.findByText( GLUE );
		unmount();

		renderDomainSettings();
		expect( await screen.findByText( GLUE ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Hide advanced settings' } ) ).toBeVisible();
	} );

	test( 'keeps the advanced rows closed after the settings remount once hidden', async () => {
		const { unmount } = renderDomainSettings();
		await showAdvanced();
		await userEvent.click(
			await screen.findByRole( 'button', { name: 'Hide advanced settings' } )
		);
		unmount();

		renderDomainSettings();
		expect( await screen.findByRole( 'button', SHOW_ADVANCED ) ).toBeVisible();
		expect( screen.queryByText( GLUE ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the advanced rows open for each domain separately', async () => {
		function DomainSwitcher() {
			const [ domain, setDomain ] = useState( 'example.com' );
			return (
				<>
					<button onClick={ () => setDomain( 'example.com' ) }>example.com</button>
					<button onClick={ () => setDomain( 'example.org' ) }>example.org</button>
					<DomainOverviewSettings
						domain={ getDomain( { domain } ) }
						domainDiagnostics={ undefined }
					/>
				</>
			);
		}
		render( <DomainSwitcher /> );
		await showAdvanced();
		await screen.findByText( GLUE );

		await userEvent.click( screen.getByRole( 'button', { name: 'example.org' } ) );
		expect( await screen.findByRole( 'button', SHOW_ADVANCED ) ).toBeVisible();
		expect( screen.queryByText( GLUE ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'example.com' } ) );
		expect( await screen.findByText( GLUE ) ).toBeVisible();
	} );

	test( 'hides the toggle when there are no advanced rows', async () => {
		renderDomainSettings( { ...connected, transfer_status: DomainTransferStatus.PENDING_ASYNC } );

		await screen.findByText( 'Site' );
		expect( screen.queryByRole( 'button', SHOW_ADVANCED ) ).not.toBeInTheDocument();
	} );
} );
