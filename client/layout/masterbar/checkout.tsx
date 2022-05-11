import config from '@automattic/calypso-config';
import { checkoutTheme, CheckoutModal } from '@automattic/composite-checkout';
import { useHasSeenWhatsNewModalQuery } from '@automattic/data-stores';
import HelpCenter, { HelpIcon, ContactForm } from '@automattic/help-center';
import { useShoppingCart } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import InlineHelpCenterContent from 'calypso/blocks/inline-help/inline-help-center-content';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WordPressWordmark from 'calypso/components/wordpress-wordmark';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useValidCheckoutBackUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-valid-checkout-back-url';
import { leaveCheckout } from 'calypso/my-sites/checkout/composite-checkout/lib/leave-checkout';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Item from './item';
import Masterbar from './masterbar';

interface Props {
	title: string;
	isJetpackNotAtomic?: boolean;
	previousPath?: string;
	siteSlug?: string;
	isLeavingAllowed?: boolean;
}

const CheckoutMasterbar: FunctionComponent< Props > = ( {
	title,
	isJetpackNotAtomic,
	previousPath,
	siteSlug,
	isLeavingAllowed,
} ) => {
	const translate = useTranslate();
	const jetpackCheckoutBackUrl = useValidCheckoutBackUrl( siteSlug );
	const siteId = useSelector( getSelectedSiteId );

	const { isLoading, data } = useHasSeenWhatsNewModalQuery( siteId );

	const isJetpackCheckout = window.location.pathname.startsWith( '/checkout/jetpack' );
	const isJetpack = isJetpackCheckout || isJetpackNotAtomic;
	const cartKey = useCartKey();
	const { responseCart, replaceProductsInCart } = useShoppingCart( cartKey );
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const [ isHelpCenterVisible, setIsHelpCenterVisible ] = useState( false );
	const [ contactForm, setContactForm ] = useState( null );
	const [ openInContactPage, setOpenInContactPage ] = useState< boolean >( false );

	const closeAndLeave = () =>
		leaveCheckout( {
			siteSlug,
			jetpackCheckoutBackUrl,
			previousPath,
			tracksEvent: 'calypso_masterbar_close_clicked',
		} );

	const clickClose = () => {
		if ( responseCart.products.length > 0 ) {
			setIsModalVisible( true );
			return;
		}
		closeAndLeave();
	};

	const modalTitleText = translate( 'You are about to leave checkout with items in your cart' );
	const modalBodyText = translate( 'You can leave the items in the cart or empty the cart.' );
	/* translators: The label to a button that will exit checkout without removing items from the shopping cart. */
	const modalPrimaryText = translate( 'Leave items' );
	/* translators: The label to a button that will remove all items from the shopping cart. */
	const modalSecondaryText = translate( 'Empty cart' );
	const clearCartAndLeave = () => {
		replaceProductsInCart( [] );
		closeAndLeave();
	};

	const isHelpCenterEnabled = config.isEnabled( 'checkout/help-center' );

	const newItems = ! isLoading && ! data?.has_seen_whats_new_modal;

	return (
		<Masterbar>
			<div className="masterbar__secure-checkout">
				{ isLeavingAllowed && (
					<Item
						icon="cross"
						className="masterbar__close-button"
						onClick={ clickClose }
						tooltip={ String( translate( 'Close Checkout' ) ) }
						tipTarget="close"
					/>
				) }
				{ ! isJetpack && <WordPressWordmark className="masterbar__wpcom-wordmark" /> }
				{ isJetpack && <JetpackLogo className="masterbar__jetpack-wordmark" full /> }
				<span className="masterbar__secure-checkout-text">{ translate( 'Secure checkout' ) }</span>
			</div>
			<Item className="masterbar__item-title">{ title }</Item>
			{ isHelpCenterEnabled && (
				<Item
					onClick={ () => setIsHelpCenterVisible( ! isHelpCenterVisible ) }
					className={ classnames( 'masterbar__item-help', {
						'is-active': isHelpCenterVisible,
					} ) }
					icon={ <HelpIcon newItems={ newItems } active={ isHelpCenterVisible } /> }
				/>
			) }
			<CheckoutModal
				title={ modalTitleText }
				copy={ modalBodyText }
				closeModal={ () => setIsModalVisible( false ) }
				isVisible={ isModalVisible }
				primaryButtonCTA={ modalPrimaryText }
				primaryAction={ closeAndLeave }
				secondaryButtonCTA={ modalSecondaryText }
				secondaryAction={ clearCartAndLeave }
			/>
			{ isHelpCenterEnabled && isHelpCenterVisible && (
				<HelpCenter
					content={
						contactForm ? (
							<ContactForm
								mode={ contactForm }
								onBackClick={ () => {
									setOpenInContactPage( true );
									setContactForm( null );
								} }
								onGoHome={ () => {
									setOpenInContactPage( false );
									setContactForm( null );
								} }
								siteId={ siteId }
							/>
						) : (
							<InlineHelpCenterContent
								setContactFormOpen={ setContactForm }
								openInContactPage={ openInContactPage }
							/>
						)
					}
					handleClose={ () => setIsHelpCenterVisible( false ) }
				/>
			) }
		</Masterbar>
	);
};

export default function CheckoutMasterbarWrapper( props: Props ): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<ThemeProvider theme={ checkoutTheme }>
				<CheckoutMasterbar { ...props } />
			</ThemeProvider>
		</CalypsoShoppingCartProvider>
	);
}
