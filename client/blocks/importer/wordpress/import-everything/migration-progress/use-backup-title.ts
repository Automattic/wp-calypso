import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import type { MigrationState } from 'calypso/blocks/importer/wordpress/types';

export default function useBackupTitle( details: MigrationState ) {
	const translate = useTranslate();
	const { step, stepTotal, stepName, backupPercent } = details;

	const generateTitle = useCallback( () => {
		const locArgs = {
			percent: Math.max( backupPercent || 0, 1 ),
			step: ( step ?? 0 ) + 1, // step starts at 0
			stepTotal: stepTotal ?? 0,
		};

		switch ( stepName ) {
			case 'backup_start':
				return translate( 'Backing up starting (%(step)d/%(stepTotal)d)', {
					args: locArgs,
				} );

			case 'backing_up_queued':
				return translate( 'Backing up: queued for processing (%(step)d/%(stepTotal)d)', {
					args: locArgs,
				} );

			case 'backing_up':
				if ( locArgs.percent < 20 ) {
					return translate( 'Backing up: preparing (%(step)d/%(stepTotal)d)', {
						args: locArgs,
					} );
				} else if ( locArgs.percent < 40 ) {
					return translate( 'Backing up: moving media files (%(step)d/%(stepTotal)d)', {
						args: locArgs,
					} );
				} else if ( locArgs.percent < 60 ) {
					return translate( 'Backing up: moving posts (%(step)d/%(stepTotal)d)', {
						args: locArgs,
					} );
				} else if ( locArgs.percent < 80 ) {
					return translate( 'Backing up: database (%(step)d/%(stepTotal)d)', {
						args: locArgs,
					} );
				} else if ( locArgs.percent <= 100 ) {
					return translate( 'Backing up: finalize (%(step)d/%(stepTotal)d)', {
						args: locArgs,
					} );
				}

			default:
				return translate( 'Backing up', {
					args: locArgs,
				} );
		}
	}, [ step, stepTotal, stepName, backupPercent ] );

	const [ title, setTitle ] = useState( generateTitle() );

	useEffect( () => setTitle( generateTitle() ), [ generateTitle ] );

	return title;
}
