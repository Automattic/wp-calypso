import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { upsell } from '../../components/icons';
import OverviewCard from '../../components/overview-card';
import { isRelativeUrl } from '../../utils/url';
import HostingFeatureGate from '../hosting-feature-gate';
import type { OverviewCardProps } from '../../components/overview-card';
import type { HostingFeatureGateProps } from '../hosting-feature-gate';

interface HostingFeatureGatedWithOverviewCardProps
	extends Omit< HostingFeatureGateProps, 'renderUpsellComponent' | 'renderActivationComponent' > {
	featureIcon: OverviewCardProps[ 'icon' ];
	upsellHeading: OverviewCardProps[ 'heading' ];
	upsellDescription: OverviewCardProps[ 'description' ];
	upsellLink: OverviewCardProps[ 'link' ];
	upsellId: string;
	upsellFeatureId?: string;
}

export default function HostingFeatureGatedWithOverviewCard( {
	featureIcon,
	upsellHeading,
	upsellDescription,
	upsellLink = '',
	...props
}: HostingFeatureGatedWithOverviewCardProps ) {
	const { upsellId, upsellFeatureId } = props;

	const cardProps: Partial< OverviewCardProps > = {
		heading: upsellHeading,
		icon: upsell,
		description: upsellDescription,
		intent: 'upsell' as const,
		link: isRelativeUrl( upsellLink )
			? addQueryArgs( upsellLink, {
					back_to: 'site-overview',
			  } )
			: upsellLink,
	};

	return (
		<HostingFeatureGate
			{ ...props }
			renderUpsellComponent={ () => (
				<OverviewCard
					{ ...cardProps }
					title={ __( 'Upgrade to unlock' ) }
					tracksId={ upsellId }
					upsellFeatureId={ upsellFeatureId ?? upsellId }
				/>
			) }
			renderActivationComponent={ () => (
				<OverviewCard
					{ ...cardProps }
					intent="activate"
					icon={ featureIcon }
					title={ __( 'Activate to unlock' ) }
					tracksId={ upsellId }
				/>
			) }
		/>
	);
}
