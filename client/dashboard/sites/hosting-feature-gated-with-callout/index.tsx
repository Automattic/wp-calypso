import { CalloutOverlay } from '../../components/callout-overlay';
import HostingFeatureGate from '../hosting-feature-gate';
import ActivationCallout from './activation';
import UpsellCallout, { UpsellCalloutProps } from './upsell';
import type { HostingFeatureGateProps } from '../hosting-feature-gate';

type HostingFeatureGatedWithCalloutProps = Omit<
	HostingFeatureGateProps,
	'renderUpsellComponent' | 'renderActivationComponent'
> &
	UpsellCalloutProps & {
		asOverlay?: boolean;
	};

export default function HostingFeatureGatedWithCallout( {
	asOverlay,
	upsellIcon,
	upsellImage,
	upsellTitle,
	upsellDescription,
	...props
}: HostingFeatureGatedWithCalloutProps ) {
	const { site, tracksFeatureId } = props;

	return (
		<HostingFeatureGate
			{ ...props }
			renderUpsellComponent={ ( { onClick } ) => {
				const callout = (
					<UpsellCallout
						site={ site }
						tracksFeatureId={ tracksFeatureId }
						onClick={ onClick }
						upsellIcon={ upsellIcon }
						upsellImage={ upsellImage }
						upsellTitle={ upsellTitle }
						upsellDescription={ upsellDescription }
					/>
				);

				if ( asOverlay ) {
					return <CalloutOverlay callout={ callout } />;
				}

				return callout;
			} }
			renderActivationComponent={ ( { onClick } ) => (
				<ActivationCallout asOverlay={ asOverlay } onClick={ onClick } />
			) }
		/>
	);
}
