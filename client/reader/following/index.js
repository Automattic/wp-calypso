import page from '@automattic/calypso-router';

export default function () {
	page( '/following/manage', ( { querystring } ) => {
		page.redirect( '/read/subscriptions' + ( querystring ? '?' + querystring : '' ) );
	} );

	page( '/following/edit*', '/following/manage' );

	// Send /following to Reader root
	page( '/following', '/read' );
}
