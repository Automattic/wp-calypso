import React from 'react';
import { hasAtomicFeature, hasPlanFeature } from '../../utils/site-features';
import HostingFeatureActivation from './activation';
import HostingFeatureUpsell from './upsell';
import type { CalloutProps } from '../../components/callout/types';
import type { Site } from '../../data/types';
import type { HostingFeatures } from '../features';

interface HostingFeatureProps {
	site: Site;
	feature: HostingFeatures;
	tracksFeatureId: string;
	upsellIcon?: CalloutProps[ 'icon' ];
	upsellImage?: CalloutProps[ 'image' ];
	upsellTitle?: CalloutProps[ 'title' ];
	upsellDescription?: CalloutProps[ 'description' ];
	children: React.ReactNode;
}

export default function HostingFeature( props: HostingFeatureProps ) {
	const { site, feature, tracksFeatureId, children } = props;

	if ( hasAtomicFeature( site, feature ) ) {
		return children;
	}

	if ( hasPlanFeature( site, feature ) ) {
		return (
			<HostingFeatureActivation
				site={ site }
				feature={ feature }
				tracksFeatureId={ tracksFeatureId }
			/>
		);
	}

	return (
		<HostingFeatureUpsell
			site={ site }
			tracksFeatureId={ tracksFeatureId }
			icon={ props.upsellIcon }
			image={ props.upsellImage }
			title={ props.upsellTitle }
			description={ props.upsellDescription }
		/>
	);
}
