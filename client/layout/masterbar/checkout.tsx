import { checkoutTheme } from '@automattic/composite-checkout';
import { Step } from '@automattic/onboarding';
import { ThemeProvider } from '@emotion/react';
import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import {
	LeaveCheckoutModal,
	useCheckoutLeaveModal,
} from 'calypso/my-sites/checkout/src/components/leave-checkout-modal';
import { useCheckoutHelpCenter } from 'calypso/my-sites/checkout/src/hooks/use-checkout-help-center';
import Masterbar from './masterbar';

interface Props {
	title: string;
	isJetpackNotAtomic?: boolean;
	previousPath?: string;
	siteSlug?: string;
	isLeavingAllowed?: boolean;
	shouldClearCartWhenLeaving?: boolean;
	loadHelpCenterIcon?: boolean;
	isGravatarDomain?: boolean;
}

const CheckoutMasterbar = ( {
	isJetpackNotAtomic,
	siteSlug,
	isLeavingAllowed,
	loadHelpCenterIcon,
	isGravatarDomain,
}: Props ) => {
	const leaveModalProps = useCheckoutLeaveModal( { siteUrl: siteSlug ?? '' } );
	const { helpCenterButtonCopy, helpCenterButtonLink, toggleHelpCenter } = useCheckoutHelpCenter();
	const isMobileViewport = useViewportMatch( 'small', '<' );

	const getCheckoutType = () => {
		// Woo Hosted sites are supposed to default to WPcom colors, but without
		// a logo. We should update this once we have a better way to identify
		// Garden sites outside of the Hosting Dashboard.
		if ( isJetpackNotAtomic && siteSlug?.endsWith( '.commerce-garden.com' ) ) {
			return 'woo-hosted';
		}

		if ( window.location.pathname.startsWith( '/checkout/jetpack' ) || isJetpackNotAtomic ) {
			return 'jetpack';
		}

		if ( window.location.pathname.startsWith( '/checkout/akismet' ) ) {
			return 'akismet';
		}

		if ( window.location.pathname.startsWith( '/checkout/agency/referral' ) ) {
			return 'a4a';
		}

		if ( window.location.pathname.startsWith( '/checkout/passport' ) ) {
			return 'passport';
		}

		if ( isGravatarDomain ) {
			return 'gravatar';
		}

		return 'wpcom';
	};
	const checkoutType = getCheckoutType();

	const showCloseButton =
		isLeavingAllowed &&
		( checkoutType === 'wpcom' || checkoutType === 'gravatar' || checkoutType === 'woo-hosted' );

	// Optional step indicator. The redirecting flow may pass its position via the
	// `steps_current` / `steps_total` query params — checkout has no per-flow
	// knowledge, any flow can opt in. Mobile-only, matching the onboarding header.
	const searchParams = new URLSearchParams( window.location.search );
	const stepsCurrent = Number( searchParams.get( 'steps_current' ) );
	const stepsTotal = Number( searchParams.get( 'steps_total' ) );
	const stepCounter =
		isMobileViewport &&
		Number.isInteger( stepsCurrent ) &&
		stepsCurrent > 0 &&
		Number.isInteger( stepsTotal ) &&
		stepsTotal > 0 &&
		stepsCurrent <= stepsTotal
			? { current: stepsCurrent, total: stepsTotal }
			: null;

	return (
		<Masterbar
			className={ clsx( 'masterbar--is-checkout', 'masterbar--is-checkout-redesign-v1', {
				'masterbar--is-wpcom': checkoutType === 'wpcom',
				'masterbar--is-jetpack': checkoutType === 'jetpack',
				'masterbar--is-akismet': checkoutType === 'akismet',
				'masterbar--is-a4a': checkoutType === 'a4a',
				'masterbar--is-passport': checkoutType === 'passport',
			} ) }
		>
			<Step.TopBar
				leftElement={
					showCloseButton ? <Step.BackButton onClick={ leaveModalProps.clickClose } /> : undefined
				}
				rightElement={
					<>
						{ stepCounter && (
							<Step.StepCounter current={ stepCounter.current } total={ stepCounter.total } />
						) }
						{ loadHelpCenterIcon && (
							<span className="checkout-skip-button">
								{ helpCenterButtonCopy && <label>{ helpCenterButtonCopy }</label> }
								<Step.LinkButton onClick={ toggleHelpCenter }>
									{ helpCenterButtonLink }
								</Step.LinkButton>
							</span>
						) }
					</>
				}
			/>
			<LeaveCheckoutModal { ...leaveModalProps } />
		</Masterbar>
	);
};

export default function CheckoutMasterbarWrapper( props: Props ) {
	return (
		<CalypsoShoppingCartProvider>
			<ThemeProvider theme={ checkoutTheme }>
				<CheckoutMasterbar { ...props } />
			</ThemeProvider>
		</CalypsoShoppingCartProvider>
	);
}
