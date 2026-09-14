import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export function getBackupField(): Field< AgencySite > {
	return {
		id: 'agency_backup',
		label: __( 'Backup' ),
		enableSorting: false,
		getValue: ( { item } ) => !! item.has_backup,
		render: ( { item } ) =>
			item.has_backup ? (
				<Icon icon={ check } />
			) : (
				// TODO: wire up the Backup setup flow; this button is inert for now.
				<Button variant="tertiary">{ __( 'Add' ) }</Button>
			),
	};
}
