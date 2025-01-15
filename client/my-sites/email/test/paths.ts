/**
 * @jest-environment jsdom
 */

import { GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import {
	domainsManagementPrefix,
	emailManagementAllSitesPrefix,
	getAddEmailForwardsPath,
	getAddGSuiteUsersPath,
	getManageTitanAccountPath,
	getManageTitanMailboxesPath,
	getNewTitanAccountPath,
	getTitanSetUpMailboxPath,
	getTitanControlPanelRedirectPath,
	getEmailManagementPath,
	getForwardingPath,
	getPurchaseNewEmailAccountPath,
	getEmailInDepthComparisonPath,
	getProfessionalEmailCheckoutUpsellPath,
	getMailboxesPath,
	isUnderEmailManagementAll,
} from '../paths';

const siteName = 'hello.wordpress.com';
const domainName = 'hello.com';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: () => true } ) );

describe( 'path helper functions', () => {
	it( 'getAddEmailForwardsPath', () => {
		expect( getAddEmailForwardsPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/forwarding/add/${ siteName }`
		);
		expect( getAddEmailForwardsPath( ':site', ':domain', emailManagementAllSitesPrefix ) ).toEqual(
			'/email/all/:domain/forwarding/add/:site'
		);
		expect( getAddEmailForwardsPath( ':site', ':domain' ) ).toEqual(
			'/email/:domain/forwarding/add/:site'
		);
		expect( getAddEmailForwardsPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getAddEmailForwardsPath( null, null ) ).toEqual( '/email' );
		expect( getAddEmailForwardsPath( ':site', ':domain', domainsManagementPrefix ) ).toEqual(
			'/domains/manage/all/email/:domain/forwarding/add/:site'
		);

		const relativeTo = '/overview/site-domain/email';
		expect( getAddEmailForwardsPath( siteName, domainName, relativeTo ) ).toEqual(
			`/overview/site-domain/email/${ domainName }/forwarding/add/${ siteName }`
		);
	} );

	it( 'getAddGSuiteUsersPath', () => {
		const productTypePlaceholder = `:productType(${ GOOGLE_WORKSPACE_PRODUCT_TYPE }|${ GSUITE_PRODUCT_TYPE })`;

		expect( getAddGSuiteUsersPath( siteName, domainName, 'google-workspace' ) ).toEqual(
			`/email/${ domainName }/google-workspace/add-users/${ siteName }`
		);
		expect( getAddGSuiteUsersPath( ':site', ':domain', productTypePlaceholder ) ).toEqual(
			`/email/:domain/${ productTypePlaceholder }/add-users/:site`
		);
		expect( getAddGSuiteUsersPath( ':site', ':domain', 'google-workspace' ) ).toEqual(
			'/email/:domain/google-workspace/add-users/:site'
		);
		expect( getAddGSuiteUsersPath( siteName, null, 'google-workspace' ) ).toEqual(
			`/email/google-workspace/add-users/${ siteName }`
		);
		expect( getAddGSuiteUsersPath( null, null, 'google-workspace' ) ).toEqual( '/email' );
	} );

	it( 'getManageTitanAccountPath', () => {
		expect( getManageTitanAccountPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/manage/${ siteName }`
		);
		expect( getManageTitanAccountPath( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/manage/:site'
		);
		expect( getManageTitanAccountPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getManageTitanAccountPath( null, null ) ).toEqual( '/email' );
	} );

	it( 'getManageTitanMailboxesPath', () => {
		expect( getManageTitanMailboxesPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/manage-mailboxes/${ siteName }`
		);
		expect(
			getManageTitanMailboxesPath( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/titan/manage-mailboxes/:site' );
		expect( getManageTitanMailboxesPath( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/manage-mailboxes/:site'
		);
		expect( getManageTitanMailboxesPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getManageTitanMailboxesPath( null, null ) ).toEqual( '/email' );
	} );

	it( 'getNewTitanAccountPath', () => {
		expect( getNewTitanAccountPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/new/${ siteName }`
		);
		expect( getNewTitanAccountPath( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/new/:site'
		);
		expect( getNewTitanAccountPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getNewTitanAccountPath( null, null ) ).toEqual( '/email' );
	} );

	it( 'getTitanSetUpMailboxPath', () => {
		expect( getTitanSetUpMailboxPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/set-up-mailbox/${ siteName }`
		);
		expect( getTitanSetUpMailboxPath( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/set-up-mailbox/:site'
		);
		expect( getTitanSetUpMailboxPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getTitanSetUpMailboxPath( null, null ) ).toEqual( '/email' );
	} );

	it( 'getTitanControlPanelRedirectPath', () => {
		expect( getTitanControlPanelRedirectPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/control-panel/${ siteName }`
		);
		expect(
			getTitanControlPanelRedirectPath( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/titan/control-panel/:site' );
		expect( getTitanControlPanelRedirectPath( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/control-panel/:site'
		);
		expect( getTitanControlPanelRedirectPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getTitanControlPanelRedirectPath( null, null ) ).toEqual( '/email' );
	} );

	it( 'getEmailManagementPath', () => {
		expect( getEmailManagementPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/manage/${ siteName }`
		);
		expect( getEmailManagementPath( ':site', ':domain', emailManagementAllSitesPrefix ) ).toEqual(
			'/email/all/:domain/manage/:site'
		);
		expect( getEmailManagementPath( ':site', ':domain' ) ).toEqual( '/email/:domain/manage/:site' );
		expect( getEmailManagementPath( ':site' ) ).toEqual( '/email/:site' );
		expect( getEmailManagementPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getEmailManagementPath( null, null ) ).toEqual( '/email' );

		const relativeTo = '/domains/manage/all/email';
		expect( getEmailManagementPath( siteName, domainName, relativeTo ) ).toEqual(
			`/domains/manage/all/email/${ domainName }/${ siteName }`
		);

		const inSiteContext = true;
		expect( getEmailManagementPath( siteName, domainName, relativeTo, {}, inSiteContext ) ).toEqual(
			`/overview/site-domain/email/${ domainName }/${ siteName }`
		);
	} );

	it( 'getForwardingPath', () => {
		expect( getForwardingPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/forwarding/${ siteName }`
		);
		expect( getForwardingPath( ':site', ':domain', emailManagementAllSitesPrefix ) ).toEqual(
			'/email/all/:domain/forwarding/:site'
		);
		expect( getForwardingPath( ':site', ':domain' ) ).toEqual( '/email/:domain/forwarding/:site' );
		expect( getForwardingPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getForwardingPath( null, null ) ).toEqual( '/email' );
	} );

	it( 'getPurchaseNewEmailAccountPath', () => {
		expect( getPurchaseNewEmailAccountPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/purchase/${ siteName }`
		);
		expect(
			getPurchaseNewEmailAccountPath( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/purchase/:site' );
		expect( getPurchaseNewEmailAccountPath( ':site', ':domain' ) ).toEqual(
			'/email/:domain/purchase/:site'
		);
		expect( getPurchaseNewEmailAccountPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getPurchaseNewEmailAccountPath( null, null ) ).toEqual( '/email' );
	} );

	it( 'getEmailInDepthComparisonPath', () => {
		expect( getEmailInDepthComparisonPath( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/compare/${ siteName }`
		);
		expect( getEmailInDepthComparisonPath( ':site', ':domain' ) ).toEqual(
			'/email/:domain/compare/:site'
		);
		expect( getEmailInDepthComparisonPath( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( getEmailInDepthComparisonPath( null, null ) ).toEqual( '/email' );

		const relativeTo = '/domains/manage/all/email';
		expect( getEmailInDepthComparisonPath( siteName, domainName, relativeTo ) ).toEqual(
			`/domains/manage/all/email/${ domainName }/compare/${ siteName }?referrer=${ encodeURIComponent(
				relativeTo
			) }`
		);
	} );

	it( 'getMailboxesPath', () => {
		expect( getMailboxesPath( siteName ) ).toEqual( `/mailboxes/${ siteName }` );
		expect( getMailboxesPath( ':site' ) ).toEqual( '/mailboxes/:site' );
		expect( getMailboxesPath() ).toEqual( '/mailboxes' );
	} );

	it( 'getProfessionalEmailCheckoutUpsellPath', () => {
		expect( getProfessionalEmailCheckoutUpsellPath( siteName, domainName, 1234 ) ).toEqual(
			`/checkout/offer-professional-email/${ domainName }/1234/${ siteName }`
		);
		expect( getProfessionalEmailCheckoutUpsellPath( ':site', ':domain', ':receiptId' ) ).toEqual(
			'/checkout/offer-professional-email/:domain/:receiptId/:site'
		);
	} );

	it.each( [
		[ '/domains', false ],
		[ '/email', false ],
		[ '/email/all', false ],
		[ '/email/all/', true ],
	] )( 'isUnderEmailManagement %s', ( path, expectedResult ) => {
		expect( isUnderEmailManagementAll( path ) ).toEqual( expectedResult );
	} );
} );
