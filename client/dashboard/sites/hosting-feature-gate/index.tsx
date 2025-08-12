import React, { ReactNode } from 'react';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import HostingFeatureActivation from './activation';
import HostingFeatureUpsell from './upsell';
import type { HostingFeatures } from '../../data/constants';
import type { Site } from '../../data/types';

export interface HostingFeatureGateProps {
	site: Site;
	feature: HostingFeatures;
	tracksFeatureId: string;
	children: ReactNode;
	renderUpsellComponent: ( { onClick }: { onClick: () => void } ) => ReactNode;
	renderActivationComponent: ( { onClick }: { onClick: () => void } ) => ReactNode;
}

export default function HostingFeatureGate( {
	site,
	feature,
	tracksFeatureId,
	children,
	renderUpsellComponent,
	renderActivationComponent,
}: HostingFeatureGateProps ) {
	if ( hasHostingFeature( site, feature ) ) {
		return children;
	}

	if ( hasPlanFeature( site, feature ) ) {
		return (
			<HostingFeatureActivation
				site={ site }
				feature={ feature }
				tracksFeatureId={ tracksFeatureId }
				renderActivationComponent={ renderActivationComponent }
			/>
		);
	}

	return (
		<HostingFeatureUpsell
			tracksFeatureId={ tracksFeatureId }
			renderUpsellComponent={ renderUpsellComponent }
		/>
	);
}
