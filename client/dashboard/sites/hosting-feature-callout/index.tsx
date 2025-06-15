import HostingFeatureActivation from './hosting-feature-activation';
import HostingFeatureUpsell from './hosting-feature-upsell';
import type { CalloutProps } from '../../components/callout/types';
import type { ReactNode } from 'react';

interface HostingFeatureCalloutProps extends Omit< CalloutProps, 'title' | 'description' > {
	canActivate: boolean;
	siteSlug: string;
	tracksId: string;
	title?: string;
	description?: ReactNode;
}

export default function HostingFeatureCallout( props: HostingFeatureCalloutProps ) {
	const { canActivate, ...restProps } = props;

	return canActivate ? <HostingFeatureActivation /> : <HostingFeatureUpsell { ...restProps } />;
}
