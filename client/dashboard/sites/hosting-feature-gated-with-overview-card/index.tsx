import { __ } from '@wordpress/i18n';
import { upsell } from '../../components/icons';
import HostingFeatureGate from '../hosting-feature-gate';
import OverviewCard from '../overview-card';
import type { HostingFeatureGateProps } from '../hosting-feature-gate';
import type { OverviewCardProps } from '../overview-card';

interface HostingFeatureGatedWithOverviewCardProps
	extends Omit< HostingFeatureGateProps, 'renderUpsellComponent' | 'renderActivationComponent' > {
	featureIcon: OverviewCardProps[ 'icon' ];
	upsellHeading: OverviewCardProps[ 'heading' ];
	upsellDescription: OverviewCardProps[ 'description' ];
	upsellLink: OverviewCardProps[ 'link' ];
}

export default function HostingFeatureGatedWithOverviewCard( {
	featureIcon,
	upsellHeading,
	upsellDescription,
	upsellLink = '',
	...props
}: HostingFeatureGatedWithOverviewCardProps ) {
	const { tracksFeatureId } = props;

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
					tracksId={ tracksFeatureId }
				/>
			) }
			renderActivationComponent={ ( { onClick } ) => (
				<OverviewCard
					{ ...cardProps }
					icon={ featureIcon }
					title={ __( 'Activate to unlock' ) }
					onClick={ onClick }
				/>
			) }
		/>
	);
}
