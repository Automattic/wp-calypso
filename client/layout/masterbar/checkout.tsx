import { WordPressWordmark, GravatarTextLogo } from '@automattic/components';
import { checkoutTheme } from '@automattic/composite-checkout';
import { ThemeProvider } from '@emotion/react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import AkismetLogo from 'calypso/components/akismet-logo';
import JetpackLogo from 'calypso/components/jetpack-logo';
import PassportLogo from 'calypso/components/passport-logo';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { DefaultMasterbarContact } from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/masterbar-styled/default-contact';
import {
	LeaveCheckoutModal,
	useCheckoutLeaveModal,
} from 'calypso/my-sites/checkout/src/components/leave-checkout-modal';
import Item from './item';
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
	title,
	isJetpackNotAtomic,
	siteSlug,
	isLeavingAllowed,
	loadHelpCenterIcon,
	isGravatarDomain,
}: Props ) => {
	const translate = useTranslate();
	const leaveModalProps = useCheckoutLeaveModal( { siteUrl: siteSlug ?? '' } );

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
			className={ clsx( 'masterbar--is-checkout', {
				'masterbar--is-wpcom': checkoutType === 'wpcom',
				'masterbar--is-jetpack': checkoutType === 'jetpack',
				'masterbar--is-akismet': checkoutType === 'akismet',
				'masterbar--is-a4a': checkoutType === 'a4a',
				'masterbar--is-passport': checkoutType === 'passport',
			} ) }
		>
			<div className="masterbar__secure-checkout">
				{ showCloseButton && (
					<Item
						icon="cross"
						className="masterbar__close-button"
						onClick={ leaveModalProps.clickClose }
						tooltip={ String( translate( 'Close Checkout' ) ) }
						tipTarget="close"
					/>
				) }
				{ checkoutType === 'wpcom' && (
					<WordPressWordmark
						size={ { width: 122, height: 'auto' } }
						className="masterbar__wpcom-wordmark"
						color="#2c3338"
					/>
				) }
				{ checkoutType === 'jetpack' && (
					<JetpackLogo className="masterbar__jetpack-wordmark" full />
				) }
				{ checkoutType === 'akismet' && <AkismetLogo className="masterbar__akismet-wordmark" /> }
				{ checkoutType === 'passport' && <PassportLogo className="masterbar__passport-wordmark" /> }
				{ checkoutType === 'gravatar' && <GravatarTextLogo /> }
				{ checkoutType === 'a4a' && <A4ALogo full size={ 14 } /> }
				<span className="masterbar__secure-checkout-text">{ translate( 'Secure checkout' ) }</span>
			</div>
			{ title && <Item className="masterbar__item-title">{ title }</Item> }
			{ loadHelpCenterIcon && <DefaultMasterbarContact /> }
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
