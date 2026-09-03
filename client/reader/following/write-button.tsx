import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

/**
 * A "Write" button for the Reader stream header that links to the write editor.
 *
 * It replaces the inline Quick Post editor that previously sat at the top of the
 * Recent feed. Like Quick Post, it only renders for users that have at least one
 * site to write to.
 */
export function WriteButton() {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const currentUser = useSelector( getCurrentUser );
	const hasSites = ( currentUser?.site_count ?? 0 ) > 0;

	if ( ! hasSites ) {
		return null;
	}

	return (
		<Button
			variant="primary"
			className="following__write-button"
			// `source=reader` tells the write editor (in jetpack-mu-wpcom) where the
			// user came from, so its back button can return them to the Reader. It
			// reuses the editor's existing `source` query param.
			href="https://wordpress.com/write-editor?source=reader"
			// The write editor is served by wpcom, not Calypso, so this must be a
			// full-page navigation rather than an SPA route. `rel="external"` stops
			// page.js from intercepting it as a client-side route.
			rel="external"
			onClick={ () => recordReaderTracksEvent( 'calypso_reader_write_button_clicked' ) }
		>
			{ translate( 'Write' ) }
		</Button>
	);
}
