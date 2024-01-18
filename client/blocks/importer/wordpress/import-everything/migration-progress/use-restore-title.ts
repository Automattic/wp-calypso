import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';

export default function useBackupTitle( restorePercent?: number, restoreMessage?: string ) {
	const translate = useTranslate();

	const generateTitle = useCallback( () => {
		const printArgs = {
			percentage: Math.max( restorePercent || 0, 1 ),
		};

		if (
			restoreMessage === 'Starting' ||
			restoreMessage?.startsWith( 'Checking remote files' ) ||
			restoreMessage?.startsWith( 'Parsing' )
		) {
			return sprintf(
				translate( 'Restoring up %(percentage)d%%. Checking remote files…' ),
				printArgs
			);
		} else if ( restoreMessage?.startsWith( 'Verifying' ) ) {
			return sprintf(
				translate( 'Restoring up %(percentage)d%%. Verifying configuration…' ),
				printArgs
			);
		} else if ( restoreMessage?.startsWith( 'Uploading' ) ) {
			return sprintf( translate( 'Restoring up %(percentage)d%%. Uploading files…' ), printArgs );
		} else if ( restoreMessage === 'Done' ) {
			return sprintf( translate( 'Finalizing restore…' ), printArgs );
		}

		return sprintf( translate( 'Restoring up %(percentage)d%%…' ), printArgs );
	}, [ restorePercent, restoreMessage ] );

	const [ title, setTitle ] = useState( generateTitle() );

	useEffect( () => setTitle( generateTitle() ), [ generateTitle ] );

	return title;
}
