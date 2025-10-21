import { CalloutOverlay } from '../../components/callout-overlay';
import HostingFeatureGate from '../hosting-feature-gate';
import ActivationCallout from './activation';
import UpsellCallout, { UpsellCalloutProps } from './upsell';
import type { HostingFeatureGateProps } from '../hosting-feature-gate';
import type { ReactNode } from 'react';

type HostingFeatureGatedWithCalloutProps = Omit<
	HostingFeatureGateProps,
	'renderUpsellComponent' | 'renderActivationComponent'
> &
	UpsellCalloutProps & {
		/**
		 * @deprecated Use `overlay` instead.
		 */
		asOverlay?: boolean;
		overlay?: ReactNode;
	};

export default function HostingFeatureGatedWithCallout( {
	asOverlay,
	overlay,
	upsellIcon,
	upsellImage,
	upsellTitle,
	upsellDescription,
	...props
}: HostingFeatureGatedWithCalloutProps ) {
	const { site, upsellId, upsellFeatureId, feature } = props;

	return (
		<HostingFeatureGate
			{ ...props }
			renderUpsellComponent={ () => {
				const callout = (
					<UpsellCallout
						site={ site }
						upsellId={ upsellId }
						upsellFeatureId={ upsellFeatureId }
						upsellIcon={ upsellIcon }
						upsellImage={ upsellImage }
						upsellTitle={ upsellTitle }
						upsellDescription={ upsellDescription }
						feature={ feature }
					/>
				);

				if ( asOverlay || overlay ) {
					return <CalloutOverlay callout={ callout } main={ overlay } />;
				}

				return callout;
			} }
			renderActivationComponent={ ( { onClick } ) => (
				<ActivationCallout main={ overlay } onClick={ onClick } />
			) }
		/>
	);
}
