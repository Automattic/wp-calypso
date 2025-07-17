import { ReactNode, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';

interface HostingFeatureUpsellProps {
	tracksFeatureId: string;
	renderUpsellComponent: ( { onClick }: { onClick: () => void } ) => ReactNode;
}

export default function HostingFeatureUpsell( {
	tracksFeatureId,
	renderUpsellComponent,
}: HostingFeatureUpsellProps ) {
	const { recordTracksEvent } = useAnalytics();
	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_upsell_impression', {
			feature_id: tracksFeatureId,
		} );
	}, [ recordTracksEvent, tracksFeatureId ] );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_upsell_click', {
			feature_id: tracksFeatureId,
		} );
	};

	return renderUpsellComponent( { onClick: handleClick } );
}
