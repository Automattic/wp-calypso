import HostingFeatureGate from '../hosting-feature-gate';
import ActivationCallout from './activation';
import UpsellCallout, { UpsellCalloutProps } from './upsell';
import type { HostingFeatureGateProps } from '../hosting-feature-gate';

type HostingFeatureGatedWithCalloutProps = Omit<
	HostingFeatureGateProps,
	'renderUpsellComponent' | 'renderActivationComponent'
> &
	UpsellCalloutProps;

export default function HostingFeatureGatedWithCallout( {
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
			renderUpsellComponent={ ( { onClick } ) => (
				<UpsellCallout
					site={ site }
					tracksFeatureId={ tracksFeatureId }
					onClick={ onClick }
					upsellIcon={ upsellIcon }
					upsellImage={ upsellImage }
					upsellTitle={ upsellTitle }
					upsellDescription={ upsellDescription }
				/>
			) }
			renderActivationComponent={ ( { onClick } ) => <ActivationCallout onClick={ onClick } /> }
		/>
	);
}
