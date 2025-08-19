import { __ } from '@wordpress/i18n';
import { upsell } from '../../components/icons';
import { isRelativeUrl } from '../../utils/url';
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

	const cardProps = {
		heading: upsellHeading,
		icon: upsell,
		description: upsellDescription,
		variant: 'upsell' as const,
		...( isRelativeUrl( upsellLink ) ? { link: upsellLink } : { externalLink: upsellLink } ),
	};

	return (
		<HostingFeatureGate
			{ ...props }
			renderUpsellComponent={ ( { onClick } ) => (
				<OverviewCard
					{ ...cardProps }
					title={ __( 'Upgrade to unlock' ) }
					tracksId={ tracksFeatureId }
					onClick={ onClick }
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
