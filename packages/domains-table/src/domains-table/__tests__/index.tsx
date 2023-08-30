/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { DomainsTable } from '..';
import { renderWithProvider, testDomain, testPartialDomain } from '../../test-utils';

const render = ( el ) => renderWithProvider( el );

const getBulkCheckbox = () =>
	screen.getByRole( 'checkbox', { name: 'Select all tick boxes for domains in table' } );
const getDomainCheckbox = ( domain: string ) =>
	screen.getByRole( 'checkbox', { name: `Tick box for ${ domain }` } );

test( 'all domain names are rendered in the table', () => {
	const { rerender } = render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
				testPartialDomain( { domain: 'example3.com' } ),
			] }
			isAllSitesView
		/>
	);

	expect( screen.queryByText( 'example1.com' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'example2.com' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'example3.com' ) ).toBeInTheDocument();

	rerender( <DomainsTable domains={ [] } isAllSitesView /> );

	expect( screen.queryByText( 'example1.com' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'example2.com' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'example3.com' ) ).not.toBeInTheDocument();
} );

test( 'when two domains share the same underlying site, there is only one fetch for detailed domain info for that site', () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
	} );
	const [ notPrimaryPartial, notPrimaryFull ] = testDomain( {
		domain: 'not-primary-domain.blog',
		blog_id: 123,
		primary_domain: false,
	} );
	const [ differentSitePartial, differentSiteFull ] = testDomain( {
		domain: 'a-different-site.com',
		blog_id: 1337,
		primary_domain: true,
	} );

	const fetchSiteDomains = jest.fn().mockImplementation( ( siteId ) =>
		Promise.resolve( {
			domains: siteId === 123 ? [ primaryFull, notPrimaryFull ] : [ differentSiteFull ],
		} )
	);

	render(
		<DomainsTable
			domains={ [ primaryPartial, notPrimaryPartial, differentSitePartial ] }
			isAllSitesView
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	expect( fetchSiteDomains ).toHaveBeenCalledTimes( 2 );
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 1337 );
} );

test( 'when shouldDisplayPrimaryDomainLabel is true, the primary domain label is displayed if a domain is marked as primary', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'example.com',
		blog_id: 123,
		primary_domain: true,
		wpcom_domain: false,
	} );

	const [ notPrimaryPartial, notPrimaryFull ] = testDomain( {
		domain: 'example.wordpress.com',
		blog_id: 123,
		primary_domain: false,
		wpcom_domain: true,
	} );

	const fetchSiteDomains = jest.fn().mockImplementation( ( siteId ) =>
		Promise.resolve( {
			domains: siteId === 123 ? [ primaryFull, notPrimaryFull ] : [],
		} )
	);

	const { rerender } = render(
		<DomainsTable
			domains={ [ primaryPartial, notPrimaryPartial ] }
			fetchSiteDomains={ fetchSiteDomains }
			isAllSitesView={ false }
		/>
	);

	await waitFor( () => {
		const [ , rowOne, rowTwo ] = screen.getAllByRole( 'row' );

		expect( within( rowOne ).queryByText( 'example.com' ) ).toBeInTheDocument();
		expect( within( rowOne ).queryByText( 'Primary domain' ) ).toBeInTheDocument();

		expect( within( rowTwo ).queryByText( 'example.wordpress.com' ) ).toBeInTheDocument();
		expect( within( rowTwo ).queryByText( 'Primary domain' ) ).not.toBeInTheDocument();
	} );

	// Test that the label is not displayed when displayPrimaryDomainLabel is false
	rerender(
		<DomainsTable
			domains={ [ primaryPartial, notPrimaryPartial ] }
			fetchSiteDomains={ fetchSiteDomains }
			isAllSitesView={ true }
		/>
	);

	expect( screen.queryByText( 'Primary domain' ) ).not.toBeInTheDocument();
} );

test( 'when the user has no selected domains, all checkboxes are unchecked', () => {
	render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	const bulkCheckbox = getBulkCheckbox();
	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );
	const secondDomainsCheckbox = getDomainCheckbox( 'example2.com' );

	expect( bulkCheckbox ).not.toBeChecked();
	expect( firstDomainsCheckbox ).not.toBeChecked();
	expect( secondDomainsCheckbox ).not.toBeChecked();
} );

test( 'when the user selects one domain, the bulk domains checkbox becomes partially checked', () => {
	render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	const bulkCheckbox = getBulkCheckbox();
	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );
	const secondDomainsCheckbox = getDomainCheckbox( 'example2.com' );

	fireEvent.click( firstDomainsCheckbox );

	expect( bulkCheckbox ).toBePartiallyChecked();
	expect( firstDomainsCheckbox ).toBeChecked();
	expect( secondDomainsCheckbox ).not.toBeChecked();
} );

test( 'when the user selects all domains, the bulk domains checkbox becomes checked', () => {
	render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	const bulkCheckbox = getBulkCheckbox();
	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );
	const secondDomainsCheckbox = getDomainCheckbox( 'example2.com' );

	fireEvent.click( firstDomainsCheckbox );
	fireEvent.click( secondDomainsCheckbox );

	expect( bulkCheckbox ).toBeChecked();
	expect( firstDomainsCheckbox ).toBeChecked();
	expect( secondDomainsCheckbox ).toBeChecked();
} );

test( 'when no domains are checked and the user clicks the bulk checkbox, all domains become checked', () => {
	render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	const bulkCheckbox = getBulkCheckbox();
	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );
	const secondDomainsCheckbox = getDomainCheckbox( 'example2.com' );

	fireEvent.click( bulkCheckbox );

	expect( bulkCheckbox ).toBeChecked();
	expect( firstDomainsCheckbox ).toBeChecked();
	expect( secondDomainsCheckbox ).toBeChecked();
} );

test( 'when a subset of domains are checked and the user clicks the bulk checkbox, all domains become checked', () => {
	render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	const bulkCheckbox = getBulkCheckbox();
	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );
	const secondDomainsCheckbox = getDomainCheckbox( 'example2.com' );

	fireEvent.click( firstDomainsCheckbox );

	expect( bulkCheckbox ).toBePartiallyChecked();
	expect( firstDomainsCheckbox ).toBeChecked();
	expect( secondDomainsCheckbox ).not.toBeChecked();

	fireEvent.click( bulkCheckbox );

	expect( bulkCheckbox ).toBeChecked();
	expect( firstDomainsCheckbox ).toBeChecked();
	expect( secondDomainsCheckbox ).toBeChecked();
} );

test( 'when all domains are checked and the user clicks the bulk checkbox, all domains become unchecked', () => {
	render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	const bulkCheckbox = getBulkCheckbox();
	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );
	const secondDomainsCheckbox = getDomainCheckbox( 'example2.com' );

	fireEvent.click( bulkCheckbox );
	expect( bulkCheckbox ).toBeChecked();
	expect( firstDomainsCheckbox ).toBeChecked();
	expect( secondDomainsCheckbox ).toBeChecked();

	fireEvent.click( bulkCheckbox );

	expect( bulkCheckbox ).not.toBeChecked();
	expect( firstDomainsCheckbox ).not.toBeChecked();
	expect( secondDomainsCheckbox ).not.toBeChecked();
} );

test( 'when the domains list changes, the bulk selection removes dangling domains', () => {
	const { rerender } = render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	fireEvent.click( getBulkCheckbox() );
	expect( getBulkCheckbox() ).toBeChecked();
	expect( getDomainCheckbox( 'example1.com' ) ).toBeChecked();
	expect( getDomainCheckbox( 'example2.com' ) ).toBeChecked();

	rerender(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example3.com' } ),
			] }
			isAllSitesView
		/>
	);

	expect( getBulkCheckbox() ).toBePartiallyChecked();
	expect( getDomainCheckbox( 'example1.com' ) ).toBeChecked();
	expect( getDomainCheckbox( 'example3.com' ) ).not.toBeChecked();
} );

test( 'bulk actions controls appear when a domain is selected', async () => {
	render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	fireEvent.click( getDomainCheckbox( 'example1.com' ) );

	expect( screen.getByRole( 'button', { name: 'Auto-renew settings' } ) ).toBeInTheDocument();

	fireEvent.click( getDomainCheckbox( 'example1.com' ) );

	expect( screen.queryByRole( 'button', { name: 'Auto-renew settings' } ) ).not.toBeInTheDocument();
} );

test( 'Owner column is rendered when domains has owner', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: 'owner',
	} );

	const fetchSiteDomains = jest.fn().mockImplementation( () =>
		Promise.resolve( {
			domains: [ primaryFull ],
		} )
	);

	render(
		<DomainsTable
			domains={ [ primaryPartial ] }
			isAllSitesView
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	await waitFor( () => {
		expect( screen.queryByText( 'Owner' ) ).toBeInTheDocument();
	} );
} );

test( 'Owner column is rendered when domains has owner that is not the currently logged in user', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: 'owner',
		current_user_is_owner: false,
	} );

	const fetchSiteDomains = jest.fn().mockImplementation( () =>
		Promise.resolve( {
			domains: [ primaryFull ],
		} )
	);

	render(
		<DomainsTable
			domains={ [ primaryPartial ] }
			isAllSitesView
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	await waitFor( () => {
		expect( screen.queryByText( 'Owner' ) ).toBeInTheDocument();
	} );
} );
test( 'Owner column is not rendered when domains do not have an owner', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: '',
	} );

	const fetchSiteDomains = jest.fn().mockImplementation( () =>
		Promise.resolve( {
			domains: [ primaryFull ],
		} )
	);

	render(
		<DomainsTable
			domains={ [ primaryPartial ] }
			isAllSitesView
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	await waitFor( () => {
		expect( screen.queryByText( 'Owner' ) ).not.toBeInTheDocument();
	} );
} );
