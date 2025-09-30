import { __experimentalVStack as VStack } from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { ThreatDescription } from '../components/threat-description';
import { ThreatsDetailCard } from '../components/threats-detail-card';
import type { Threat, Site } from '@automattic/api-core';

export function getViewDetailsAction( site: Site ): Action< Threat > {
	return {
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
	};
}
