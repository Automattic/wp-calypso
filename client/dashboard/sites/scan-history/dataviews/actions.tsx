import { __experimentalVStack as VStack } from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { isSelfHostedJetpackConnected } from '../../../utils/site-types';
import { ThreatDescription } from '../../scan/components/threat-description';
import { ThreatsDetailCard } from '../../scan/components/threats-detail-card';
import { UnignoreThreatModal } from '../../scan/components/unignore-threat-modal';
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
		{
			id: 'view_details',
			label: __( 'View details' ),
			modalHeader: __( 'View threat details' ),
			supportsBulk: false,
			RenderModal: ( { items } ) => (
				<VStack spacing={ 4 }>
					<ThreatsDetailCard threats={ items } />
					<ThreatDescription threat={ items[ 0 ] } site={ site } />
				</VStack>
			),
		},
	];
}
