import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { isSelfHostedJetpackConnected } from '../../../utils/site-types';
import { UnignoreThreatModal } from '../../scan/components/unignore-threat-modal';
import { getViewDetailsAction } from '../../scan/dataviews/actions';
import type { Threat, Site } from '@automattic/api-core';

export function getActions( site: Site ): Action< Threat >[] {
	return [
		{
			id: 'unignore',
			isEligible: ( threat: Threat ) =>
				isSelfHostedJetpackConnected( site ) && threat.status === 'ignored',
			label: __( 'Unignore threat' ),
			modalHeader: __( 'Unignore threat' ),
			supportsBulk: false,
			RenderModal: ( { items, closeModal } ) => (
				<UnignoreThreatModal items={ items } closeModal={ closeModal } site={ site } />
			),
		},
		getViewDetailsAction( site ),
	];
}
