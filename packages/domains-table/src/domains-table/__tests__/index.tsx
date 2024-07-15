/**
 * @jest-environment jsdom
 */
import { fireEvent, getByText, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import { DomainsTable } from '..';
import { renderWithProvider, testDomain, testPartialDomain } from '../../test-utils';
import { transferStatus } from '../../utils/constants';

const render = ( el ) => renderWithProvider( el );

const getBulkCheckbox = () =>
	screen.getByRole( 'checkbox', { name: 'Select all tick boxes for domains in table' } );
const getDomainCheckbox = ( domain: string ) =>
	screen.getByRole( 'checkbox', { name: `Tick box for ${ domain }` } );
const getBulkUpdateContactDetailsButton = () => screen.getByText( 'Edit contact information' );

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

test( 'when isAllSitesView is true, the primary domain label is displayed if a domain is marked as primary', async () => {
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
			siteSlug="example.com"
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
			isAllSitesView
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

test( 'Owner column is not rendered when all domains have the same owner', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: 'owner',
	} );

	const [ notPrimaryPartial, notPrimaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 124,
		primary_domain: true,
		owner: 'owner',
	} );

	const fetchSiteDomains = jest.fn().mockImplementation( () =>
		Promise.resolve( {
			domains: [ primaryFull, notPrimaryFull ],
		} )
	);

	render(
		<DomainsTable
			domains={ [ primaryPartial, notPrimaryPartial ] }
			isAllSitesView
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	await waitFor( () => {
		expect( screen.queryByText( 'Owner' ) ).not.toBeInTheDocument();
	} );
} );

test( 'search for a domain hides other domains from table', async () => {
	const user = userEvent.setup();

	render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'dog.com' } ),
				testPartialDomain( { domain: 'cat.org' } ),
			] }
			isAllSitesView
		/>
	);

	const searchInput = screen.getByRole( 'searchbox', { name: 'Search' } );
	await user.type( searchInput, 'dog.com' );

	expect( screen.queryByText( 'dog.com' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'cat.org' ) ).not.toBeInTheDocument();
} );

test( 'when isAllSitesView is true, display site column', async () => {
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

	const fetchSite = jest.fn().mockResolvedValue( { ID: 123, name: 'Primary Domain Blog' } );

	render(
		<DomainsTable
			domains={ [ primaryPartial ] }
			isAllSitesView
			fetchSiteDomains={ fetchSiteDomains }
			fetchSite={ fetchSite }
		/>
	);

	await waitFor( () => {
		expect( fetchSite ).toHaveBeenCalled();
	} );

	expect( screen.queryByText( 'Site' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'Primary Domain Blog' ) ).toBeInTheDocument();
} );

test( 'when isAllSitesView is false, do not display site column', async () => {
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

	const fetchSite = jest.fn().mockResolvedValue( { ID: 123, name: 'Primary Domain Blog' } );

	render(
		<DomainsTable
			domains={ [ primaryPartial ] }
			isAllSitesView={ false }
			fetchSiteDomains={ fetchSiteDomains }
			fetchSite={ fetchSite }
			siteSlug={ primaryPartial.domain }
		/>
	);

	await waitFor( () => {
		expect( fetchSite ).toHaveBeenCalled();
	} );

	expect( screen.queryByText( 'Site' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'Primary Domain Blog' ) ).not.toBeInTheDocument();
} );

test( 'when isAllSitesView is false, hide wordpress.com domain if there is a wpcom staging domain', () => {
	const [ wpcomDomain ] = testDomain( {
		domain: 'primary-domain.wordpress.com',
		blog_id: 123,
		primary_domain: true,
		owner: 'owner',
		wpcom_domain: true,
	} );

	const [ wpcomStagingDomain ] = testDomain( {
		domain: 'primary-domain.wpcomstaging.com',
		blog_id: 123,
		primary_domain: true,
		owner: 'owner',
		wpcom_domain: true,
		is_wpcom_staging_domain: true,
	} );

	render(
		<DomainsTable
			domains={ [ wpcomDomain, wpcomStagingDomain ] }
			isAllSitesView={ false }
			siteSlug={ wpcomStagingDomain.domain }
		/>
	);

	expect( screen.queryByText( 'primary-domain.wpcomstaging.com' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'primary-domain.wordpress.com' ) ).not.toBeInTheDocument();
} );

test( 'when selecting a domain, display the selected count instead of the total count', () => {
	const [ primaryPartial ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: 'owner',
	} );

	const [ notPrimaryPartial ] = testDomain( {
		domain: 'not-primary-domain.blog',
		blog_id: 124,
		primary_domain: true,
		owner: 'owner',
	} );

	render( <DomainsTable domains={ [ primaryPartial, notPrimaryPartial ] } isAllSitesView /> );

	expect( screen.queryByText( '2 domains' ) ).toBeInTheDocument();

	const firstDomainsCheckbox = getDomainCheckbox( 'primary-domain.blog' );

	fireEvent.click( firstDomainsCheckbox );

	expect( screen.queryByText( '2 domains' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( '1 domain selected' ) ).toBeInTheDocument();
} );

describe( 'column sorting', () => {
	let dateTimeFormatSpy;
	const OriginalTimeFormat = Intl.DateTimeFormat;

	beforeAll( () => {
		dateTimeFormatSpy = jest.spyOn( global.Intl, 'DateTimeFormat' );
		dateTimeFormatSpy.mockImplementation(
			( locale, options ) => new OriginalTimeFormat( locale, { ...options, timeZone: 'UTC' } )
		);
	} );

	afterAll( () => {
		dateTimeFormatSpy.mockClear();
	} );

	test( 'sorts simple columns', async () => {
		const blogId = 1;

		const [ ownedByAPartial, ownedByAFull ] = testDomain( {
			domain: '1.com',
			blog_id: blogId,
			owner: 'A Owner',
			current_user_is_owner: false,
		} );

		const [ ownedByFPartial, ownedByFFull ] = testDomain( {
			domain: '2.com',
			blog_id: blogId,
			owner: 'F Owner',
			current_user_is_owner: false,
		} );

		const [ ownedByCPartial, ownedByCFull ] = testDomain( {
			domain: '3.com',
			blog_id: blogId,
			owner: 'C Owner',
			current_user_is_owner: false,
		} );

		const fetchSiteDomains = jest.fn().mockImplementation( () =>
			Promise.resolve( {
				domains: [ ownedByAFull, ownedByFFull, ownedByCFull ],
			} )
		);

		const fetchSite = jest.fn().mockResolvedValue( { ID: blogId, name: 'The blog' } );

		render(
			<DomainsTable
				domains={ [ ownedByAPartial, ownedByFPartial, ownedByCPartial ] }
				isAllSitesView
				fetchSite={ fetchSite }
				fetchSiteDomains={ fetchSiteDomains }
			/>
		);

		await waitFor( () => expect( fetchSiteDomains ).toHaveBeenCalled() );

		fireEvent.click( screen.getByText( 'Owner' ) );

		let [ , firstRow, secondRow, thirdRow ] = screen.getAllByRole( 'row' );

		expect( getByText( firstRow, 'A Owner' ) ).toBeInTheDocument();
		expect( getByText( secondRow, 'C Owner' ) ).toBeInTheDocument();
		expect( getByText( thirdRow, 'F Owner' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByText( 'Owner' ) );

		[ , firstRow, secondRow, thirdRow ] = screen.getAllByRole( 'row' );

		expect( getByText( firstRow, 'F Owner' ) ).toBeInTheDocument();
		expect( getByText( secondRow, 'C Owner' ) ).toBeInTheDocument();
		expect( getByText( thirdRow, 'A Owner' ) ).toBeInTheDocument();
	} );

	test( 'sorts by status', async () => {
		const blogId = 1;

		const [ activePartial, activeFull ] = testDomain( {
			domain: 'active.com',
			blog_id: blogId,
			wpcom_domain: false,
			type: 'registered',
			has_registration: true,
			points_to_wpcom: true,
			transfer_status: transferStatus.COMPLETED,
		} );

		const [ expiringPartial, expiringFull ] = testDomain( {
			domain: 'expiring.com',
			blog_id: blogId,
			wpcom_domain: false,
			type: 'mapping',
			has_registration: true,
			current_user_is_owner: true,
			expired: false,
			expiry: moment().add( 29, 'days' ).toISOString(),
		} );

		const [ errorPartial, errorFull ] = testDomain( {
			domain: 'error.com',
			blog_id: blogId,
			wpcom_domain: false,
			type: 'mapping',
			has_registration: false,
			expired: false,
			registration_date: moment().subtract( 5, 'days' ).toISOString(),
			expiry: moment().add( 60, 'days' ).toISOString(),
			points_to_wpcom: false,
			auto_renewing: false,
		} );

		const fetchSiteDomains = jest.fn().mockImplementation( () =>
			Promise.resolve( {
				domains: [ activeFull, expiringFull, errorFull ],
			} )
		);

		const fetchSite = jest.fn().mockResolvedValue( { ID: blogId, name: 'The blog' } );

		render(
			<DomainsTable
				domains={ [ activePartial, expiringPartial, errorPartial ] }
				isAllSitesView
				fetchSite={ fetchSite }
				fetchSiteDomains={ fetchSiteDomains }
			/>
		);

		await waitFor( () => expect( fetchSiteDomains ).toHaveBeenCalled() );

		fireEvent.click( screen.getByText( 'Status' ) );

		let [ , firstRow, secondRow, thirdRow ] = screen.getAllByRole( 'row' );

		expect( getByText( firstRow, 'active.com' ) ).toBeInTheDocument();
		expect( getByText( secondRow, 'expiring.com' ) ).toBeInTheDocument();
		expect( getByText( thirdRow, 'error.com' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByText( 'Status' ) );

		[ , firstRow, secondRow, thirdRow ] = screen.getAllByRole( 'row' );

		expect( getByText( firstRow, 'error.com' ) ).toBeInTheDocument();
		expect( getByText( secondRow, 'expiring.com' ) ).toBeInTheDocument();
		expect( getByText( thirdRow, 'active.com' ) ).toBeInTheDocument();
	} );
} );

test( 'when current user is the owner, they can bulk update contact info', () => {
	render(
		<DomainsTable
			currentUserCanBulkUpdateContactInfo
			domains={ [
				testPartialDomain( { domain: 'example1.com', current_user_is_owner: true } ),
				testPartialDomain( { domain: 'example2.com', current_user_is_owner: true } ),
			] }
			isAllSitesView
		/>
	);

	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );

	fireEvent.click( firstDomainsCheckbox );

	expect( getBulkUpdateContactDetailsButton() ).toBeEnabled();
} );

test( 'when current user is not the owner, they cannot bulk update contact info', () => {
	render(
		<DomainsTable
			currentUserCanBulkUpdateContactInfo
			domains={ [
				testPartialDomain( { domain: 'example1.com', current_user_is_owner: false } ),
				testPartialDomain( { domain: 'example2.com' } ),
			] }
			isAllSitesView
		/>
	);

	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );
	const secondDomainsCheckbox = getDomainCheckbox( 'example2.com' );

	fireEvent.click( firstDomainsCheckbox );
	fireEvent.click( secondDomainsCheckbox );

	expect( getBulkUpdateContactDetailsButton() ).toBeDisabled();
} );

test( 'when the current user is not allowed to bulk update the contact info, disable the action', () => {
	render(
		<DomainsTable
			currentUserCanBulkUpdateContactInfo={ false }
			isAllSitesView
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
				testPartialDomain( { domain: 'example3.com' } ),
			] }
		/>
	);

	const firstDomainsCheckbox = getDomainCheckbox( 'example1.com' );

	fireEvent.click( firstDomainsCheckbox );

	expect( getBulkUpdateContactDetailsButton() ).toBeDisabled();
} );
