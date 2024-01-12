/**
 * @jest-environment jsdom
 */

import { GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import {
	emailManagementAllSitesPrefix,
	emailManagementAddEmailForwards,
	emailManagementAddGSuiteUsers,
	emailManagementManageTitanAccount,
	emailManagementManageTitanMailboxes,
	emailManagementNewTitanAccount,
	emailManagementTitanSetUpMailbox,
	emailManagementTitanSetUpThankYou,
	emailManagementTitanControlPanelRedirect,
	emailManagement,
	emailManagementForwarding,
	emailManagementPurchaseNewEmailAccount,
	emailManagementInDepthComparison,
	emailManagementMailboxes,
	isUnderEmailManagementAll,
} from '../paths';

const siteName = 'hello.wordpress.com';
const domainName = 'hello.com';

describe( 'path helper functions', () => {
	it( 'emailManagementAddEmailForwards', () => {
		expect( emailManagementAddEmailForwards( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/forwarding/add/${ siteName }`
		);
		expect(
			emailManagementAddEmailForwards( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/forwarding/add/:site' );
		expect( emailManagementAddEmailForwards( ':site', ':domain' ) ).toEqual(
			'/email/:domain/forwarding/add/:site'
		);
		expect( emailManagementAddEmailForwards( siteName, '' ) ).toEqual(
			`/email//forwarding/add/${ siteName }`
		);
		expect( emailManagementAddEmailForwards( '', '' ) ).toEqual( `/email//forwarding/add/` );
	} );

	it( 'emailManagementAddGSuiteUsers', () => {
		const productTypePlaceholder = `:productType(${ GOOGLE_WORKSPACE_PRODUCT_TYPE }|${ GSUITE_PRODUCT_TYPE })`;

		expect( emailManagementAddGSuiteUsers( siteName, domainName, 'google-workspace' ) ).toEqual(
			`/email/${ domainName }/google-workspace/add-users/${ siteName }`
		);
		expect( emailManagementAddGSuiteUsers( ':site', ':domain', productTypePlaceholder ) ).toEqual(
			`/email/:domain/${ productTypePlaceholder }/add-users/:site`
		);
		expect( emailManagementAddGSuiteUsers( ':site', ':domain', 'google-workspace' ) ).toEqual(
			'/email/:domain/google-workspace/add-users/:site'
		);
		expect( emailManagementAddGSuiteUsers( siteName, null, 'google-workspace' ) ).toEqual(
			`/email/google-workspace/add-users/${ siteName }`
		);
		expect( emailManagementAddGSuiteUsers( null, null, 'google-workspace' ) ).toEqual(
			`/email/google-workspace/add-users/null`
		);
	} );

	it( 'emailManagementManageTitanAccount', () => {
		expect( emailManagementManageTitanAccount( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/manage/${ siteName }`
		);
		expect(
			emailManagementManageTitanAccount( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/titan/manage/:site' );
		expect( emailManagementManageTitanAccount( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/manage/:site'
		);
		expect( emailManagementManageTitanAccount( siteName, '' ) ).toEqual(
			`/email//titan/manage/${ siteName }`
		);
		expect( emailManagementManageTitanAccount( null, '' ) ).toEqual( '/email//titan/manage/null' );
	} );

	it( 'emailManagementManageTitanMailboxes', () => {
		expect( emailManagementManageTitanMailboxes( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/manage-mailboxes/${ siteName }`
		);
		expect(
			emailManagementManageTitanMailboxes( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/titan/manage-mailboxes/:site' );
		expect( emailManagementManageTitanMailboxes( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/manage-mailboxes/:site'
		);
		expect( emailManagementManageTitanMailboxes( siteName, '' ) ).toEqual(
			`/email//titan/manage-mailboxes/${ siteName }`
		);
		expect( emailManagementManageTitanMailboxes( null, '' ) ).toEqual(
			'/email//titan/manage-mailboxes/null'
		);
	} );

	it( 'emailManagementNewTitanAccount', () => {
		expect( emailManagementNewTitanAccount( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/new/${ siteName }`
		);
		expect(
			emailManagementNewTitanAccount( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/titan/new/:site' );
		expect( emailManagementNewTitanAccount( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/new/:site'
		);
		expect( emailManagementNewTitanAccount( siteName, '' ) ).toEqual(
			`/email//titan/new/${ siteName }`
		);
		expect( emailManagementNewTitanAccount( null, '' ) ).toEqual( '/email//titan/new/null' );
	} );

	it( 'emailManagementTitanSetUpMailbox', () => {
		expect( emailManagementTitanSetUpMailbox( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/set-up-mailbox/${ siteName }`
		);
		expect(
			emailManagementTitanSetUpMailbox( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/titan/set-up-mailbox/:site' );
		expect( emailManagementTitanSetUpMailbox( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/set-up-mailbox/:site'
		);
		expect( emailManagementTitanSetUpMailbox( siteName, '' ) ).toEqual(
			`/email//titan/set-up-mailbox/${ siteName }`
		);
		expect( emailManagementTitanSetUpMailbox( null, '' ) ).toEqual(
			`/email//titan/set-up-mailbox/null`
		);
	} );

	it( 'emailManagementTitanSetUpThankYou', () => {
		expect( emailManagementTitanSetUpThankYou( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/set-up-mailbox/thank-you/${ siteName }`
		);
		expect(
			emailManagementTitanSetUpThankYou( ':site', ':domain', null, emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/titan/set-up-mailbox/thank-you/:site' );
		expect( emailManagementTitanSetUpThankYou( siteName, '' ) ).toEqual(
			`/email//titan/set-up-mailbox/thank-you/${ siteName }`
		);
		expect( emailManagementTitanSetUpThankYou( null, '' ) ).toEqual(
			`/email//titan/set-up-mailbox/thank-you/null`
		);
	} );

	it( 'emailManagementTitanControlPanelRedirect', () => {
		expect( emailManagementTitanControlPanelRedirect( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/control-panel/${ siteName }`
		);
		expect(
			emailManagementTitanControlPanelRedirect( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/titan/control-panel/:site' );
		expect( emailManagementTitanControlPanelRedirect( ':site', ':domain' ) ).toEqual(
			'/email/:domain/titan/control-panel/:site'
		);
		expect( emailManagementTitanControlPanelRedirect( siteName, '' ) ).toEqual(
			`/email//titan/control-panel/${ siteName }`
		);
		expect( emailManagementTitanControlPanelRedirect( null, '' ) ).toEqual(
			`/email//titan/control-panel/null`
		);
	} );

	it( 'emailManagement', () => {
		expect( emailManagement( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/manage/${ siteName }`
		);
		expect( emailManagement( ':site', ':domain', emailManagementAllSitesPrefix ) ).toEqual(
			'/email/all/:domain/manage/:site'
		);
		expect( emailManagement( ':site', ':domain' ) ).toEqual( '/email/:domain/manage/:site' );
		expect( emailManagement( ':site' ) ).toEqual( '/email/:site' );
		expect( emailManagement( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( emailManagement( null, null ) ).toEqual( `/email` );
	} );

	it( 'emailManagementForwarding', () => {
		expect( emailManagementForwarding( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/forwarding/${ siteName }`
		);
		expect(
			emailManagementForwarding( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/forwarding/:site' );
		expect( emailManagementForwarding( ':site', ':domain' ) ).toEqual(
			'/email/:domain/forwarding/:site'
		);
		expect( emailManagementForwarding( siteName, '' ) ).toEqual(
			`/email//forwarding/${ siteName }`
		);
		expect( emailManagementForwarding( null, '' ) ).toEqual( `/email//forwarding/null` );
	} );

	it( 'emailManagementPurchaseNewEmailAccount', () => {
		expect( emailManagementPurchaseNewEmailAccount( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/purchase/${ siteName }`
		);
		expect(
			emailManagementPurchaseNewEmailAccount( ':site', ':domain', emailManagementAllSitesPrefix )
		).toEqual( '/email/all/:domain/purchase/:site' );
		expect( emailManagementPurchaseNewEmailAccount( ':site', ':domain' ) ).toEqual(
			'/email/:domain/purchase/:site'
		);
		expect( emailManagementPurchaseNewEmailAccount( siteName, '' ) ).toEqual(
			`/email//purchase/${ siteName }`
		);
		expect( emailManagementPurchaseNewEmailAccount( null, '' ) ).toEqual( `/email//purchase/null` );
	} );

	it( 'emailManagementInDepthComparison', () => {
		expect( emailManagementInDepthComparison( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/compare/${ siteName }`
		);
		expect( emailManagementInDepthComparison( ':site', ':domain' ) ).toEqual(
			'/email/:domain/compare/:site'
		);
		expect( emailManagementInDepthComparison( siteName, '' ) ).toEqual(
			`/email//compare/${ siteName }`
		);
		expect( emailManagementInDepthComparison( null, '' ) ).toEqual( `/email//compare/null` );
	} );

	it( 'emailManagementMailboxes', () => {
		expect( emailManagementMailboxes( siteName ) ).toEqual( `/mailboxes/${ siteName }` );
		expect( emailManagementMailboxes( ':site' ) ).toEqual( '/mailboxes/:site' );
		expect( emailManagementMailboxes() ).toEqual( '/mailboxes' );
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
