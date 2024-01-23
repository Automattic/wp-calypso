import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import type { MigrationState } from 'calypso/blocks/importer/wordpress/types';

export default function useBackupTitle( details: MigrationState ) {
	const translate = useTranslate();
	const { step, stepTotal, stepName, restorePercent } = details;

	const generateTitle = useCallback( () => {
		const locArgs = {
			percent: Math.max( restorePercent || 0, 1 ),
			step: ( step ?? 0 ) + 1, // step starts at 0
			stepTotal: stepTotal ?? 0,
		};

		switch ( stepName ) {
			case 'restore_start':
				return translate( 'Restoring starting (%(step)d/%(stepTotal)d)', {
					args: locArgs,
				} );

			case 'checking_remote_files':
				return translate( 'Restoring: remote check - %(percent)d% (%(step)d/%(stepTotal)d)', {
					args: locArgs,
				} );

			case 'verifying_backup_configurations':
				return translate(
					'Restoring: verifying configuration - %(percent)d% (%(step)d/%(stepTotal)d)',
					{
						args: locArgs,
					}
				);

			case 'streaming_files':
				return translate( 'Restoring: upload media - %(percent)d% (%(step)d/%(stepTotal)d)', {
					args: locArgs,
				} );

			case 'preparing_database':
				return translate( 'Restoring: database preparing - %(percent)d% (%(step)d/%(stepTotal)d)', {
					args: locArgs,
				} );

			case 'checking_symlinks':
			case 'parsing_manifest':
				return translate(
					'Restoring: database management - %(percent)d% (%(step)d/%(stepTotal)d)',
					{
						args: locArgs,
					}
				);

			case 'restoring_database':
				return translate( 'Restoring: database transfer - %(percent)d% (%(step)d/%(stepTotal)d)', {
					args: locArgs,
				} );

			case 'done':
				return translate( 'Restoring: finalize - %(percent)d% (%(step)d/%(stepTotal)d)', {
					args: locArgs,
				} );

			default:
				return translate( 'Restoring up %(percent)d%', {
					args: locArgs,
				} );
		}
	}, [ step, stepTotal, stepName, restorePercent ] );

	const [ title, setTitle ] = useState( generateTitle() );

	useEffect( () => setTitle( generateTitle() ), [ generateTitle ] );

	return title;
}
