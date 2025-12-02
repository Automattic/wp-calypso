import { ReactNode } from 'react';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import HostingFeatureActivation from './activation';
import type { HostingFeatureSlug, Site } from '@automattic/api-core';

export interface HostingFeatureGateProps {
	site: Site;
	feature: HostingFeatureSlug;
	upsellId: string;
	upsellFeatureId?: string;
	children: ReactNode;
	renderUpsellComponent: () => ReactNode;
	renderActivationComponent: ( { onClick }: { onClick: () => void } ) => ReactNode;
}

export default function HostingFeatureGate( {
	site,
	feature,
	upsellId,
	upsellFeatureId,
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
				tracksFeatureId={ upsellFeatureId ?? upsellId }
				renderActivationComponent={ renderActivationComponent }
			/>
		);
	}

	return renderUpsellComponent();
}
