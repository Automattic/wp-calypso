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
		recordTracksEvent( 'calypso_dashboard_upsell_impression', {
			feature: tracksFeatureId,
			type: 'hosting-feature-gate',
		} );
	}, [ recordTracksEvent, tracksFeatureId ] );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_upsell_click', {
			feature: tracksFeatureId,
			type: 'hosting-feature-gate',
		} );
	};

	return renderUpsellComponent( { onClick: handleClick } );
}
