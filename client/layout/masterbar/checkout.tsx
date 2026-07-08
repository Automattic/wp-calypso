import { WordPressLogo } from '@automattic/components';
import { checkoutTheme } from '@automattic/composite-checkout';
import { ThemeProvider } from '@emotion/react';
import { Icon } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();
	const leaveModalProps = useCheckoutLeaveModal( { siteUrl: siteSlug ?? '' } );
	const { helpCenterButtonLink, toggleHelpCenter } = useCheckoutHelpCenter();

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
			<div className="masterbar__secure-checkout">
				<WordPressLogo size={ 21 } className="masterbar__wp-circle-logo" />
				{ showCloseButton && (
					<>
						<div className="masterbar__redesign-divider" />
						<button className="masterbar__back-button" onClick={ leaveModalProps.clickClose }>
							<Icon icon={ chevronLeft } size={ 18 } />
							{ translate( 'Back' ) }
						</button>
					</>
				) }
			</div>
			{ loadHelpCenterIcon && (
				<button className="masterbar__need-help-button" onClick={ toggleHelpCenter }>
					{ helpCenterButtonLink }
				</button>
			) }
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
