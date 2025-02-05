import page from '@automattic/calypso-router';

export default function () {
	page( '/following/manage', ( { querystring } ) => {
		page.redirect( '/reader/subscriptions' + ( querystring ? '?' + querystring : '' ) );
	} );

	page( '/following/edit*', '/following/manage' );

	// Send /following to Reader root
	page( '/following', '/reader' );
}
