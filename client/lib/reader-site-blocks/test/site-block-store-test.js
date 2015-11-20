/**
 * External Dependencies
 */
var expect = require( 'chai' ).expect,
	Dispatcher = require( 'dispatcher' );

var SiteBlockStore = require( '../index' );

describe( 'site-block-store', function() {

	it( 'should have a dispatch token', function() {
		expect( SiteBlockStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should not store a block if there is an API error', function() {

		var siteId = 123;

		// The action from the UI - follow should be stored optimistically
		Dispatcher.handleViewAction( {
			type: 'BLOCK_SITE',
			data: { siteId: siteId },
			error: null
		} );

		expect( SiteBlockStore.getIsBlocked( siteId ) ).to.eq( true );

		// The response from the API - if there is a problem here, the
		// block should be removed from the store and an error made available
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_BLOCK_SITE',
			siteId: siteId,
			data: { success: false },
			error: null
		} );

		expect( SiteBlockStore.getIsBlocked( siteId ) ).to.eq( false );
		expect( SiteBlockStore.getLastErrorBySite( siteId ).errorType ).to.be.ok;

		// The response from the API - if there is a problem here, the
		// block should be removed from the store and an error made available
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_BLOCK_SITE',
			siteId: siteId,
			data: null,
			error: new Error( 'There was a problem' )
		} );

		expect( SiteBlockStore.getIsBlocked( siteId ) ).to.eq( false );
		expect( SiteBlockStore.getLastErrorBySite( siteId ).errorType ).to.be.ok;
	} );

} );
