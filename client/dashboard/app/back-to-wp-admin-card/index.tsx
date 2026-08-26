import { omnibarSiteIdQuery, siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { isLocalWpAdminOrigin } from '../../sites/overview-blogger/mock-sites';
import SitePreview from '../../sites/site-preview';
import { getSiteDisplayName } from '../../utils/site-name';

import './style.scss';

const STORAGE_KEY = 'dashboard-back-to-wp-admin';
const BACK_URL_KEY = 'dashboard-back-to-wp-admin-url';

// Prototype: the Studio sites are the only wp-admins the demo links to.
// Cross-origin referrers are trimmed to the origin, so that is all we can
// (and need to) match.
function arrivedFromWpAdmin() {
	const params = new URLSearchParams( window.location.search );
	if ( params.get( 'ref' ) === 'wp-admin' || params.has( 'origin_site_id' ) ) {
		return true;
	}
	if ( ! document.referrer ) {
		return false;
	}
	try {
		return isLocalWpAdminOrigin( new URL( document.referrer ).origin );
	} catch {
		return false;
	}
}

// The `back` param carries the exact wp-admin page the user left. Only local
// wp-admin URLs are accepted, so the card never links off the demo sites.
function capturedBackUrl() {
	const back = new URLSearchParams( window.location.search ).get( 'back' );
	if ( ! back ) {
		return null;
	}
	try {
		const url = new URL( back );
		if ( isLocalWpAdminOrigin( url.origin ) && url.pathname.startsWith( '/wp-admin' ) ) {
			return url.href;
		}
	} catch {
		// Malformed URL: ignore.
	}
	return null;
}

// Runs once per page load: a fresh arrival from wp-admin re-shows the card
// even if it was dismissed earlier in the session, and refreshes the return
// URL (an arrival without one clears it, so the card falls back to the admin
// root rather than an outdated page).
if ( typeof window !== 'undefined' && arrivedFromWpAdmin() ) {
	window.sessionStorage.setItem( STORAGE_KEY, 'visible' );
	const backUrl = capturedBackUrl();
	if ( backUrl ) {
		window.sessionStorage.setItem( BACK_URL_KEY, backUrl );
	} else {
		window.sessionStorage.removeItem( BACK_URL_KEY );
	}
}

export default function BackToWpAdminCard() {
	const [ status, setStatus ] = useState< 'hidden' | 'visible' | 'leaving' >( 'hidden' );
	const [ backUrl ] = useState( () => window.sessionStorage.getItem( BACK_URL_KEY ) );

	useEffect( () => {
		if ( window.sessionStorage.getItem( STORAGE_KEY ) === 'visible' ) {
			setStatus( 'visible' );
		}
	}, [] );

	const { data: siteId } = useQuery( omnibarSiteIdQuery() );
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: !! siteId,
	} );

	const adminUrl = site?.options?.admin_url;
	if ( status === 'hidden' || ! site || ! adminUrl ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'back-to-wp-admin-card', { 'is-leaving': status === 'leaving' } ) }
			onAnimationEnd={
				status === 'leaving'
					? () => {
							window.sessionStorage.setItem( STORAGE_KEY, 'dismissed' );
							setStatus( 'hidden' );
					  }
					: undefined
			}
		>
			<a
				className="back-to-wp-admin-card-link"
				href={ backUrl ?? adminUrl }
				aria-label={ sprintf(
					/* translators: %s: site name */
					__( 'Back to WP Admin (%s)' ),
					getSiteDisplayName( site )
				) }
			>
				<SitePreview url={ site.URL } scale={ 0.2 } width={ 1200 } height={ 900 } />
			</a>
			<span className="back-to-wp-admin-card-overlay">
				<Button
					className="back-to-wp-admin-card-cta"
					variant="primary"
					href={ backUrl ?? adminUrl }
				>
					{ __( 'Back to WP Admin' ) }
				</Button>
			</span>
			<Button
				className="back-to-wp-admin-card-dismiss"
				icon={ closeSmall }
				label={ __( 'Dismiss' ) }
				onClick={ () => setStatus( 'leaving' ) }
			/>
		</div>
	);
}
