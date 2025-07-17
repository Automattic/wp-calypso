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
	upsellExternalLink: OverviewCardProps[ 'externalLink' ];
}

export default function HostingFeatureGatedWithOverviewCard( {
	featureIcon,
	upsellHeading,
	upsellDescription,
	upsellExternalLink,
	...props
}: HostingFeatureGatedWithOverviewCardProps ) {
	const { tracksFeatureId } = props;

	const cardProps = {
		heading: upsellHeading,
		icon: upsell,
		description: upsellDescription,
		trackId: tracksFeatureId,
		variant: 'upsell' as const,
	};

	return (
		<HostingFeatureGate
			{ ...props }
			renderUpsellComponent={ ( { onClick } ) => (
				<OverviewCard
					{ ...cardProps }
					title={ __( 'Upgrade to unlock' ) }
					externalLink={ upsellExternalLink }
					onClick={ onClick }
				/>
			) }
			renderActivationComponent={ ( { onClick } ) => (
				<OverviewCard
					{ ...cardProps }
					icon={ featureIcon }
					title={ __( 'Activate to unlock' ) }
					externalLink=""
					onClick={ onClick }
				/>
			) }
		/>
	);
}
