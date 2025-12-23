import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import FlashMessage from '../components/flash-message';

export function InviteAcceptedFlashMessage() {
	const message = useRef( '' );

	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		const params = new URLSearchParams( window.location.search );
		if (
			params.get( 'flash' ) === 'invite-accepted' &&
			params.get( 'invite-role' ) &&
			params.get( 'invite-site-title' )
		) {
			const role = params.get( 'invite-role' )!;
			const siteTitle = params.get( 'invite-site-title' )!;

			// Construct role-based message (simplified for snackbar)
			switch ( role ) {
				case 'follower':
					// Translators: %s is the site title.
					message.current = sprintf( __( 'You’re now following %s.' ), siteTitle );
					break;
				case 'viewer':
					// Translators: %s is the site title.
					message.current = sprintf( __( 'You’re now a viewer of %s.' ), siteTitle );
					break;
				case 'administrator':
					// Translators: %s is the site title.
					message.current = sprintf( __( 'You’re now an Administrator of %s.' ), siteTitle );
					break;
				case 'editor':
					// Translators: %s is the site title.
					message.current = sprintf( __( 'You’re now an Editor of %s.' ), siteTitle );
					break;
				case 'author':
					// Translators: %s is the site title.
					message.current = sprintf( __( 'You’re now an Author of %s.' ), siteTitle );
					break;
				case 'contributor':
					// Translators: %s is the site title.
					message.current = sprintf( __( 'You’re now a Contributor of %s.' ), siteTitle );
					break;
				case 'subscriber':
					// Translators: %s is the site title.
					message.current = sprintf( __( 'You’re now a Subscriber of %s.' ), siteTitle );
					break;
				default:
					// Translators: %s is the site title.
					message.current = sprintf( __( '%s joined.' ), siteTitle );
			}

			params.delete( 'invite-role' );
			params.delete( 'invite-site-title' );
			const newUrl =
				window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
			window.history.replaceState( {}, '', newUrl );
		}

		// This effect has side effects, like editing the URL. We only ever want to run it once on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	if ( ! message.current ) {
		return null;
	}

	return <FlashMessage id="invite-accepted" message={ message.current } />;
}
