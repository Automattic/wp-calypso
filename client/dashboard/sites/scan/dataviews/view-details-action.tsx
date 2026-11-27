import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { ViewDetailsModal } from '../components/view-details-modal';
import type { Threat, Site } from '@automattic/api-core';

export function getViewDetailsAction( site: Site ): Action< Threat > {
	return {
		id: 'view_details',
		label: __( 'View details' ),
		modalHeader: __( 'Threat details' ),
		supportsBulk: false,
		RenderModal: ( props ) => <ViewDetailsModal { ...props } site={ site } />,
	};
}
