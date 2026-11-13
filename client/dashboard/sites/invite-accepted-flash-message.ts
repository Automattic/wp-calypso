import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useConsumeSearchParams } from '../app/hooks/use-consume-search-params';
import { FLASH_QUERY_PARAM } from '../components/flash-message';

function getInviteAcceptedMessage( role: string, siteTitle: string ) {
	// Construct role-based message (simplified for snackbar)
	switch ( role ) {
		case 'follower':
			// Translators: %s is the site title.
			return sprintf( __( 'You’re now following %s.' ), siteTitle );
		case 'viewer':
			// Translators: %s is the site title.
			return sprintf( __( 'You’re now a viewer of %s.' ), siteTitle );
		case 'administrator':
			// Translators: %s is the site title.
			return sprintf( __( 'You’re now an Administrator of %s.' ), siteTitle );
		case 'editor':
			// Translators: %s is the site title.
			return sprintf( __( 'You’re now an Editor of %s.' ), siteTitle );
		case 'author':
			// Translators: %s is the site title.
			return sprintf( __( 'You’re now an Author of %s.' ), siteTitle );
		case 'contributor':
			// Translators: %s is the site title.
			return sprintf( __( 'You’re now a Contributor of %s.' ), siteTitle );
		case 'subscriber':
			// Translators: %s is the site title.
			return sprintf( __( 'You’re now a Subscriber of %s.' ), siteTitle );
		default:
			// Translators: %s is the site title.
			return sprintf( __( '%s joined.' ), siteTitle );
	}
}

export function InviteAcceptedFlashMessage() {
	const { createSuccessNotice } = useDispatch( noticesStore );

	useConsumeSearchParams( [ FLASH_QUERY_PARAM, 'invite-role', 'invite-site-title' ], {
		when: ( params ) =>
			params[ FLASH_QUERY_PARAM ] === 'invite-accepted' &&
			!! params[ 'invite-role' ] &&
			!! params[ 'invite-site-title' ],
		onConsume: ( params ) =>
			createSuccessNotice(
				getInviteAcceptedMessage( params[ 'invite-role' ]!, params[ 'invite-site-title' ]! ),
				{ type: 'snackbar' }
			),
	} );

	return null;
}
