import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import type { MigrationState } from 'calypso/blocks/importer/wordpress/types';

export default function useBackupTitle( details: MigrationState ) {
	const translate = useTranslate();

	const generateTitle = useCallback( () => {
		const printArgs = {
			percentage: Math.max( details.restorePercent || 0, 1 ),
		};

		if (
			details.restoreMessage === 'Starting' ||
			details.restoreMessage?.startsWith( 'Checking remote files' ) ||
			details.restoreMessage?.startsWith( 'Parsing' )
		) {
			return sprintf(
				translate( 'Restoring up %(percentage)d%%. Checking remote files…' ),
				printArgs
			);
		} else if ( details.restoreMessage?.startsWith( 'Verifying' ) ) {
			return sprintf(
				translate( 'Restoring up %(percentage)d%%. Verifying configuration…' ),
				printArgs
			);
		} else if ( details.restoreMessage?.startsWith( 'Uploading' ) ) {
			return sprintf( translate( 'Restoring up %(percentage)d%%. Uploading files…' ), printArgs );
		} else if ( details.restoreMessage === 'Done' ) {
			return sprintf( translate( 'Finalizing restore…' ), printArgs );
		}

		return sprintf( translate( 'Restoring up %(percentage)d%%…' ), printArgs );
	}, [ details.restorePercent, details.restoreMessage ] );

	const [ title, setTitle ] = useState( generateTitle() );

	useEffect( () => setTitle( generateTitle() ), [ generateTitle ] );

	return title;
}
