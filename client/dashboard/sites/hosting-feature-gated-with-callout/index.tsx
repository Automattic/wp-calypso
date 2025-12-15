import { useRouterState } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { CalloutOverlay } from '../../components/callout-overlay';
import SnackbarBackButton from '../../components/snackbar-back-button';
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
	const {
		location: { search },
	} = useRouterState();

	const { site, upsellId, upsellFeatureId, feature } = props;

	const backButton = search.back_to === 'overview' && (
		<SnackbarBackButton>{ __( 'Back to Overview' ) }</SnackbarBackButton>
	);

	return (
		<HostingFeatureGate
			{ ...props }
			renderUpsellComponent={ () => {
				let callout = (
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
					callout = <CalloutOverlay callout={ callout } main={ overlay } />;
				}

				return (
					<>
						{ callout }
						{ backButton }
					</>
				);
			} }
			renderActivationComponent={ () => (
				<>
					<ActivationCallout
						site={ site }
						main={ overlay }
						feature={ feature }
						tracksFeatureId={ upsellFeatureId ?? upsellId }
					/>
					{ backButton }
				</>
			) }
		/>
	);
}
