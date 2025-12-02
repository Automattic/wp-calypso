import { __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ThreatDescription } from './threat-description';
import { ThreatsDetailCard } from './threats-detail-card';
import type { Threat, Site } from '@automattic/api-core';
import type { RenderModalProps } from '@wordpress/dataviews';

interface ViewDetailsModalProps extends RenderModalProps< Threat > {
	site: Site;
}

export function ViewDetailsModal( { items, site }: ViewDetailsModalProps ) {
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_scan_view_details_modal_open' );
	}, [ recordTracksEvent ] );

	return (
		<VStack spacing={ 4 }>
			<ThreatsDetailCard threats={ items } />
			<ThreatDescription threat={ items[ 0 ] } site={ site } />
		</VStack>
	);
}
