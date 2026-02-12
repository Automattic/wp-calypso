import { ReactNode } from 'react';
import { hasHostingFeature, hasPlanFeature } from '../../utils/site-features';
import type { HostingFeatureSlug, Site } from '@automattic/api-core';

export interface HostingFeatureGateProps {
	site: Site;
	feature: HostingFeatureSlug;
	children: ReactNode;
	renderUpsellComponent: () => ReactNode;
	renderActivationComponent: () => ReactNode;
}

export default function HostingFeatureGate( {
	site,
	feature,
	children,
	renderUpsellComponent,
	renderActivationComponent,
}: HostingFeatureGateProps ) {
	if ( hasHostingFeature( site, feature ) ) {
		return children;
	}

	if ( hasPlanFeature( site, feature ) ) {
		return renderActivationComponent();
	}

	return renderUpsellComponent();
}
