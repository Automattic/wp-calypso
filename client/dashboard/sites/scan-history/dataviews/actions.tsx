import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import type { Threat } from '@automattic/api-core';

export function getActions(): Action< Threat >[] {
	return [
		{
			id: 'unignore',
			isEligible: ( threat: Threat ) => threat.status === 'ignored',
			label: __( 'Unignore threat' ),
			modalHeader: __( 'Unignore threat' ),
			supportsBulk: false,
			// @TODO: render the proper unignore modal
			RenderModal: ( { items } ) => <p>Unignore threat { items[ 0 ].id }</p>,
		},
		{
			id: 'view_details',
			isEligible: ( threat: Threat ) => threat.status !== 'ignored',
			label: __( 'View details' ),
			modalHeader: __( 'Threat' ),
			supportsBulk: false,
			// @TODO: render the proper details modal
			RenderModal: ( { items } ) => <p>Details of threat { items[ 0 ].id }</p>,
		},
	];
}
