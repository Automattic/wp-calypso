import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { byteToMB } from 'calypso/blocks/importer/util';

export default function useBackupTitle(
	backupPercent?: number,
	backupMedia?: number,
	backupPosts?: number,
	siteSize?: number
) {
	const translate = useTranslate();

	const generateTitle = useCallback( () => {
		if ( backupPercent === 100 ) {
			if ( backupMedia ) {
				return sprintf( translate( 'Moving your %(count)d files…' ), {
					count: backupMedia,
				} );
			} else if ( backupPosts ) {
				return sprintf( translate( 'Moving your %(count)d posts…' ), {
					count: backupPosts,
				} );
			}

			return translate( 'Moving your files…' );
		}

		if ( typeof backupPercent === 'undefined' ) {
			return translate( 'Backing up your data…' );
		}

		const percent = Math.max( backupPercent, 1 );

		if ( typeof siteSize === 'undefined' ) {
			return sprintf( translate( 'Backing up %(percentage)d%% of your data…' ), {
				percentage: percent,
			} );
		}

		return sprintf( translate( 'Backing up %(percentage)d%% of your %(size)f MB of data…' ), {
			percentage: percent,
			size: byteToMB( siteSize ),
		} );
	}, [ backupPercent, backupMedia, backupPosts, siteSize ] );

	const [ title, setTitle ] = useState( generateTitle() );

	useEffect( () => setTitle( generateTitle() ), [ generateTitle ] );

	return title;
}
