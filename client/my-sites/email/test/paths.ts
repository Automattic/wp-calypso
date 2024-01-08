/**
 * @jest-environment jsdom
 */

import {
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
		expect( emailManagementAddEmailForwards( siteName, '' ) ).toEqual(
			`/email//forwarding/add/${ siteName }`
		);
		expect( emailManagementAddEmailForwards( '', '' ) ).toEqual( `/email//forwarding/add/` );
	} );

	it( 'emailManagementAddGSuiteUsers', () => {
		expect( emailManagementAddGSuiteUsers( siteName, domainName, 'google-workspace' ) ).toEqual(
			`/email/${ domainName }/google-workspace/add-users/${ siteName }`
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
		expect( emailManagementManageTitanAccount( siteName, '' ) ).toEqual(
			`/email//titan/manage/${ siteName }`
		);
		expect( emailManagementManageTitanAccount( null, '' ) ).toEqual( '/email//titan/manage/null' );
	} );

	it( 'emailManagementManageTitanMailboxes', () => {
		expect( emailManagementManageTitanMailboxes( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/manage-mailboxes/${ siteName }`
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
		expect( emailManagementNewTitanAccount( siteName, '' ) ).toEqual(
			`/email//titan/new/${ siteName }`
		);
		expect( emailManagementNewTitanAccount( null, '' ) ).toEqual( '/email//titan/new/null' );
	} );

	it( 'emailManagementTitanSetUpMailbox', () => {
		expect( emailManagementTitanSetUpMailbox( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/titan/set-up-mailbox/${ siteName }`
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
		expect( emailManagement( siteName, null ) ).toEqual( `/email/${ siteName }` );
		expect( emailManagement( null, null ) ).toEqual( `/email` );
	} );

	it( 'emailManagementForwarding', () => {
		expect( emailManagementForwarding( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/forwarding/${ siteName }`
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
		expect( emailManagementPurchaseNewEmailAccount( siteName, '' ) ).toEqual(
			`/email//purchase/${ siteName }`
		);
		expect( emailManagementPurchaseNewEmailAccount( null, '' ) ).toEqual( `/email//purchase/null` );
	} );

	it( 'emailManagementInDepthComparison', () => {
		expect( emailManagementInDepthComparison( siteName, domainName ) ).toEqual(
			`/email/${ domainName }/compare/${ siteName }`
		);
		expect( emailManagementInDepthComparison( siteName, '' ) ).toEqual(
			`/email//compare/${ siteName }`
		);
		expect( emailManagementInDepthComparison( null, '' ) ).toEqual( `/email//compare/null` );
	} );

	it( 'emailManagementMailboxes', () => {
		expect( emailManagementMailboxes( siteName ) ).toEqual( `/mailboxes/${ siteName }` );
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
