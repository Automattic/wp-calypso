import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { bumpStat } from '../panel/rest-client/bump-stat';

const READER_NOTIFICATIONS_URL = 'https://wordpress.com/reader/notifications';

/**
 * Resolves to whether this frame can use its WordPress.com cookies, requesting
 * storage access without a prompt when the browser has already granted it.
 */
export async function hasCookieAccess() {
	if ( ! document.hasStorageAccess || ! document.requestStorageAccess ) {
		return true;
	}

	try {
		if ( await document.hasStorageAccess() ) {
			return true;
		}
	} catch {
		return true;
	}

	try {
		await document.requestStorageAccess();
		return true;
	} catch {
		return false;
	}
}

/**
 * Explains why notifications need cookie access and lets the user allow it or open notifications on WordPress.com instead.
 */
export function StorageAccessPrompt( { canRequestAccess, onAccessGranted } ) {
	const translate = useTranslate();
	const [ isDenied, setIsDenied ] = useState( false );
	let promptState = 'ask';
	if ( ! canRequestAccess ) {
		promptState = 'unavailable';
	} else if ( isDenied ) {
		promptState = 'denied';
	}

	useEffect( () => {
		bumpStat( 'notes-storage-access', `${ promptState }_shown` );
	}, [ promptState ] );

	const requestAccess = async () => {
		bumpStat( 'notes-storage-access', 'allow_clicked' );
		try {
			await document.requestStorageAccess();
		} catch {
			bumpStat( 'notes-storage-access', 'denied' );
			setIsDenied( true );
			return;
		}
		bumpStat( 'notes-storage-access', 'granted' );
		onAccessGranted();
	};

	const promptCopy = {
		ask: {
			heading: translate( 'Show your notifications on this site?' ),
			body: translate(
				'Your browser blocks WordPress.com from using its cookies on other sites. Allow access to see your notifications here, or open them on WordPress.com.'
			),
		},
		denied: {
			heading: translate( 'Access wasn’t allowed' ),
			body: translate( 'You can try again, or see your notifications on WordPress.com instead.' ),
		},
		unavailable: {
			heading: translate( 'Your notifications can’t load here' ),
			body: translate(
				'Make sure you’re logged in to WordPress.com. Some browser privacy settings also stop notifications from loading on other sites, so you can open them on WordPress.com instead.'
			),
		},
	}[ promptState ];

	return (
		<div className="wpnc__empty-notes-container wpnc__storage-access">
			<div className="wpnc__empty-notes">
				<h2>{ promptCopy.heading }</h2>
				<p>{ promptCopy.body }</p>
				<div className="wpnc__storage-access-actions">
					{ promptState !== 'unavailable' && (
						<button type="button" onClick={ requestAccess }>
							{ promptState === 'denied' ? translate( 'Try again' ) : translate( 'Allow access' ) }
						</button>
					) }
					<a
						href={ READER_NOTIFICATIONS_URL }
						target="_top"
						onClick={ () => bumpStat( 'notes-storage-access', 'open_full_page_clicked' ) }
					>
						{ translate( 'Open on WordPress.com' ) }
					</a>
				</div>
			</div>
		</div>
	);
}
