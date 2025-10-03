import React, { ReactNode } from 'react';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import HostingFeatureActivation from './activation';
import HostingFeatureUpsell from './upsell';
import type { HostingFeatureSlug, Site } from '@automattic/api-core';

export interface HostingFeatureGateProps {
	site: Site;
	feature: HostingFeatureSlug;
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
