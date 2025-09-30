import { __experimentalVStack as VStack } from '@wordpress/components';
import { Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ThreatDescription } from '../../scan/components/threat-description';
import { ThreatsDetailCard } from '../../scan/components/threats-detail-card';
import { UnignoreThreatModal } from '../../scan/components/unignore-threat-modal';
import type { Threat } from '@automattic/api-core';

export function useActions( siteId: number ): Action< Threat >[] {
	const { recordTracksEvent } = useAnalytics();

	return useMemo(
		() => [
			{
				id: 'unignore',
				isEligible: ( threat: Threat ) => threat.status === 'ignored',
				label: __( 'Unignore threat' ),
				modalHeader: __( 'Unignore threat' ),
				supportsBulk: false,
				RenderModal: ( { items, closeModal } ) => (
					<UnignoreThreatModal items={ items } closeModal={ closeModal } siteId={ siteId } />
				),
			},
			{
				id: 'view_details',
				isEligible: ( threat: Threat ) => threat.status !== 'ignored',
				label: __( 'View details' ),
				modalHeader: __( 'View threat details' ),
				supportsBulk: false,
				callback: () => {
					recordTracksEvent( 'calypso_dashboard_scan_view_details_click' );
				},
				RenderModal: ( { items } ) => (
					<VStack spacing={ 4 }>
						<ThreatsDetailCard threats={ items } />
						<ThreatDescription threat={ items[ 0 ] } />
					</VStack>
				),
			},
		],
		[ siteId, recordTracksEvent ]
	);
}
