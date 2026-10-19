/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen, act, waitFor } from '@testing-library/react';
import { renderWithProvider } from '../../test-utils';
import { ResponseDomain } from '../../utils/types';
import { DomainsTableStateContext } from '../domains-table';
import { DomainsTableRowActions } from '../domains-table-row-actions';

jest.mock( '@automattic/calypso-router' );

// Mock context value to avoid network requests from useGenerateDomainsTableState hooks
const mockContextValue = {
	onDomainAction: jest.fn(),
	userCanSetPrimaryDomains: false,
	updatingDomain: null,
	domainStatusPurchaseActions: undefined,
	hasConnectableSites: false,
};

const render = ( el ) =>
	renderWithProvider( el, {
		wrapper: function Wrapper( { children } ) {
			return (
				<DomainsTableStateContext.Provider value={ mockContextValue as any }>
					{ children }
				</DomainsTableStateContext.Provider>
			);
		},
	} );

const domain = {
	name: 'example.com',
	domain: 'example.com',
	type: 'registered',
	canManageDnsRecords: true,
} as ResponseDomain;

const defaultProps = {
	domain,
	siteSlug: 'example',
};

test( 'when settings action is clicked it should show the settings page', async () => {
	render( <DomainsTableRowActions { ...defaultProps } /> );

	const domainAction = screen.getByRole( 'button', {
		name: 'Domain actions',
	} );

	await act( async () => {
		domainAction.click();
	} );

	const settingsAction = screen.getByText( 'View settings' );
	settingsAction.click();

	expect( page ).toHaveBeenCalledWith( '/domains/manage/example.com/edit/example' );
} );

test( 'when dns action is clicked it should show the dns page', async () => {
	render( <DomainsTableRowActions { ...defaultProps } /> );

	const domainAction = screen.getByRole( 'button', {
		name: 'Domain actions',
	} );

	await act( async () => {
		domainAction.click();
	} );

	const dnsAction = screen.getByText( 'Manage DNS' );
	dnsAction.click();

	expect( page ).toHaveBeenCalledWith( '/domains/manage/example.com/dns/example' );
} );

test( 'when contact action is clicked it should show the contact page', async () => {
	render( <DomainsTableRowActions { ...defaultProps } /> );

	const domainAction = screen.getByRole( 'button', {
		name: 'Domain actions',
	} );

	await act( async () => {
		domainAction.click();
	} );

	const contactAction = screen.getByText( 'Manage contact information' );
	contactAction.click();

	expect( page ).toHaveBeenCalledWith( '/domains/manage/example.com/edit-contact-info/example' );
} );

test( 'when transfer action is clicked it should show the transfer page', async () => {
	const transferDomain = {
		...domain,
		type: 'mapping',
		isEligibleForInboundTransfer: true,
	} as ResponseDomain;

	const props = {
		...defaultProps,
		domain: transferDomain,
	};

	render( <DomainsTableRowActions { ...props } /> );

	const domainAction = screen.getByRole( 'button', {
		name: 'Domain actions',
	} );

	await act( async () => {
		domainAction.click();
	} );

	const transferAction = screen.getByText( 'Transfer to WordPress.com' );
	transferAction.click();

	expect( page ).toHaveBeenCalledWith(
		'/domains/add/use-my-domain/example?initialQuery=example.com&initialMode=transfer-domain'
	);
} );

describe( 'change site address action', () => {
	const siteAddressDomain = {
		...domain,
		name: 'example.wordpress.com',
		domain: 'example.wordpress.com',
		type: 'wpcom',
	} as ResponseDomain;

	const openMenu = async (
		props: Partial< React.ComponentProps< typeof DomainsTableRowActions > >
	) => {
		render(
			<DomainsTableRowActions
				{ ...defaultProps }
				domain={ siteAddressDomain }
				isAllSitesView={ false }
				isSimpleSite
				{ ...props }
			/>
		);

		await act( async () => {
			screen.getByRole( 'button', { name: 'Domain actions' } ).click();
		} );
	};

	test( 'is shown for a Simple site', async () => {
		await openMenu( {} );

		await waitFor( () => expect( screen.getByText( 'Change site address' ) ).toBeVisible() );
	} );

	test( 'is hidden for a suspended site', async () => {
		await openMenu( { domain: { ...siteAddressDomain, isSuspendedSite: true } } );

		expect( screen.queryByText( 'Change site address' ) ).not.toBeInTheDocument();
	} );
} );
