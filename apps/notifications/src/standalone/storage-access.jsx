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
 * Asks the user to allow cookie access, with a link to the full notifications page as a fallback.
 */
export function StorageAccessPrompt( { canRequestAccess, onAccessGranted } ) {
	const translate = useTranslate();
	const [ isDenied, setIsDenied ] = useState( false );
	const showsAllowButton = canRequestAccess && ! isDenied;

	useEffect( () => {
		bumpStat( 'notes-storage-access', showsAllowButton ? 'prompt_shown' : 'fallback_shown' );
	}, [ showsAllowButton ] );

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

	return (
		<div className="wpnc__empty-notes-container wpnc__storage-access">
			<div className="wpnc__empty-notes">
				<h2>
					{ showsAllowButton
						? translate( 'Allow access to see your notifications' )
						: translate( 'Your notifications can’t load here' ) }
				</h2>
				{ showsAllowButton && (
					<p>
						<button type="button" onClick={ requestAccess }>
							{ translate( 'Allow access' ) }
						</button>
					</p>
				) }
				<p>
					<a
						href={ READER_NOTIFICATIONS_URL }
						target="_top"
						onClick={ () => bumpStat( 'notes-storage-access', 'fallback_clicked' ) }
					>
						{ translate( 'Open notifications on WordPress.com' ) }
					</a>
				</p>
			</div>
		</div>
	);
}
