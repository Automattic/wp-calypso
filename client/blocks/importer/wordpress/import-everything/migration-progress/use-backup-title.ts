import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { byteToMB } from 'calypso/blocks/importer/util';
import type { MigrationState } from 'calypso/blocks/importer/wordpress/types';

export default function useBackupTitle( details: MigrationState ) {
	const translate = useTranslate();

	const generateTitle = useCallback( () => {
		if ( details.backupPercent === 100 ) {
			if ( details.backupMedia ) {
				return sprintf( translate( 'Moving your %(count)d files…' ), {
					count: details.backupMedia,
				} );
			} else if ( details.backupPosts ) {
				return sprintf( translate( 'Moving your %(count)d posts…' ), {
					count: details.backupPosts,
				} );
			}

			return translate( 'Moving your files…' );
		}

		if ( typeof details.backupPercent === 'undefined' ) {
			return translate( 'Backing up your data…' );
		}

		const percent = Math.max( details.backupPercent ?? 0, 1 );

		if ( typeof details.siteSize === 'undefined' ) {
			return sprintf( translate( 'Backing up %(percentage)d%% of your data…' ), {
				percentage: percent,
			} );
		}

		return sprintf( translate( 'Backing up %(percentage)d%% of your %(size)f MB of data…' ), {
			percentage: percent,
			size: byteToMB( details.siteSize ?? 0 ),
		} );
	}, [ details.backupPercent, details.backupMedia, details.backupPosts, details.siteSize ] );

	const [ title, setTitle ] = useState( generateTitle() );

	useEffect( () => setTitle( generateTitle() ), [ generateTitle ] );

	return title;
}
