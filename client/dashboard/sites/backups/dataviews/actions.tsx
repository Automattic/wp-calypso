import { Icon } from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { getBackupUrl } from '../../../utils/site-backup';
import type { ActivityLogEntry, Site } from '../../../data/types';

export function getActions( site: Site ): Action< ActivityLogEntry >[] {
	return [
		{
			id: 'restore',
			isPrimary: true,
			icon: <Icon icon={ backup } />,
			label: __( 'Restore to this point ↗' ),
			callback: ( items: ActivityLogEntry[] ) => {
				const item = items[ 0 ];
				const url = `${ getBackupUrl( site ) }/restore/${ item.rewind_id }`;
				window.open( url, '_blank' );
			},
		},
		{
			id: 'files',
			label: __( 'View files ↗' ),
			callback: ( items: ActivityLogEntry[] ) => {
				const item = items[ 0 ];
				const url = `${ getBackupUrl( site ) }/contents/${ item.rewind_id }`;
				window.open( url, '_blank' );
			},
			isEligible: ( item: ActivityLogEntry ) => item.name === 'rewind__backup_complete_full',
		},
		{
			id: 'download',
			label: __( 'Download backup ↗' ),
			callback: ( items: ActivityLogEntry[] ) => {
				const item = items[ 0 ];
				const url = `${ getBackupUrl( site ) }/download/${ item.rewind_id }`;
				window.open( url, '_blank' );
			},
		},
	];
}
