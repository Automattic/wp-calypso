import { __ } from '@wordpress/i18n';
import { upsell } from '../../components/icons';
import HostingFeatureGate from '../hosting-feature-gate';
import { OverviewCardWithLink } from '../overview-card';
import { OverviewCardExtenalLinkIcon } from '../overview-card/link';
import OverviewCardSummary from '../overview-card/summary';
import type { HostingFeatureGateProps } from '../hosting-feature-gate';
import type { OverviewCardLinkProps, OverviewCardSummaryProps } from '../overview-card/types';

interface HostingFeatureGatedWithOverviewCardProps
	extends Omit< HostingFeatureGateProps, 'renderUpsellComponent' | 'renderActivationComponent' > {
	featureIcon: OverviewCardSummaryProps[ 'icon' ];
	upsellHeading: OverviewCardSummaryProps[ 'heading' ];
	upsellDescription: OverviewCardSummaryProps[ 'description' ];
	upsellExternalLink: OverviewCardLinkProps[ 'link' ];
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
		description: upsellDescription,
		variant: 'upsell' as const,
	};

	return (
		<HostingFeatureGate
			{ ...props }
			renderUpsellComponent={ ( { onClick } ) => (
				<OverviewCardWithLink
					link={ upsellExternalLink }
					tracksId={ tracksFeatureId }
					isExternal
					onClick={ onClick }
				>
					<OverviewCardSummary
						{ ...cardProps }
						icon={ upsell }
						title={ __( 'Upgrade to unlock' ) }
						linkIcon={ <OverviewCardExtenalLinkIcon /> }
					/>
				</OverviewCardWithLink>
			) }
			renderActivationComponent={ ( { onClick } ) => (
				<OverviewCardWithLink link="" isExternal onClick={ onClick }>
					<OverviewCardSummary
						{ ...cardProps }
						icon={ featureIcon }
						title={ __( 'Activate to unlock' ) }
						linkIcon={ <OverviewCardExtenalLinkIcon /> }
					/>
				</OverviewCardWithLink>
			) }
		/>
	);
}
