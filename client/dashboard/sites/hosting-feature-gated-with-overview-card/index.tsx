import { __ } from '@wordpress/i18n';
import { upsell } from '../../components/icons';
import OverviewCard from '../../components/overview-card';
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
		link: upsellLink,
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
