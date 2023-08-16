import { WordPressWordmark } from '@automattic/components';
import { checkoutTheme, CheckoutModal } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import AkismetLogo from 'calypso/components/akismet-logo';
import ChatButton from 'calypso/components/chat-button';
import JetpackLogo from 'calypso/components/jetpack-logo';
import MaterialIcon from 'calypso/components/material-icon';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { DefaultMasterbarContact } from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/masterbar-styled/default-contact';
import useValidCheckoutBackUrl from 'calypso/my-sites/checkout/src/hooks/use-valid-checkout-back-url';
import { leaveCheckout } from 'calypso/my-sites/checkout/src/lib/leave-checkout';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Item from './item';
import Masterbar from './masterbar';

interface Props {
	title: string;
	isJetpackNotAtomic?: boolean;
	previousPath?: string;
	siteSlug?: string;
	isLeavingAllowed?: boolean;
	loadHelpCenterIcon?: boolean;
}

const CheckoutMasterbar = ( {
	title,
	isJetpackNotAtomic,
	previousPath,
	siteSlug,
	isLeavingAllowed,
	loadHelpCenterIcon,
}: Props ) => {
	const translate = useTranslate();
	const forceCheckoutBackUrl = useValidCheckoutBackUrl( siteSlug );

	const getCheckoutType = () => {
		if ( window.location.pathname.startsWith( '/checkout/jetpack' ) || isJetpackNotAtomic ) {
			return 'jetpack';
		}

		if ( window.location.pathname.startsWith( '/checkout/akismet' ) ) {
			return 'akismet';
		}

		return 'wpcom';
	};
	const checkoutType = getCheckoutType();

	const cartKey = useCartKey();
	const { responseCart, replaceProductsInCart } = useShoppingCart( cartKey );
	const [ isModalVisible, setIsModalVisible ] = useState( false );

	const closeAndLeave = () =>
		leaveCheckout( {
			siteSlug,
			forceCheckoutBackUrl,
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

	const showCloseButton = isLeavingAllowed && checkoutType === 'wpcom';

	const initialMessage =
		'Customer is contacting us from the checkout pre-sales flow.\n' +
		`Product${ responseCart.products.length > 1 && 's' } they're attempting to purchase: ` +
		responseCart.products.map( ( product ) => product.product_name ).join( ', ' );

	const handleClick = () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_masterbar_support_click', {
				cart: JSON.stringify( responseCart ),
			} )
		);
	};

	return (
		<Masterbar
			className={ classnames( 'masterbar--is-checkout', {
				'masterbar--is-jetpack': checkoutType === 'jetpack',
				'masterbar--is-akismet': checkoutType === 'akismet',
			} ) }
		>
			<div className="masterbar__secure-checkout">
				{ showCloseButton && (
					<Item
						icon="chevron-left"
						className="masterbar__close-button"
						onClick={ clickClose }
						tooltip={ String( translate( 'Close Checkout' ) ) }
						tipTarget="close"
					/>
				) }
				{ checkoutType === 'wpcom' && (
					<WordPressWordmark className="masterbar__wpcom-wordmark" color="#2c3338" />
				) }
				{ checkoutType === 'jetpack' && (
					<JetpackLogo className="masterbar__jetpack-wordmark" full />
				) }
				{ checkoutType === 'akismet' && <AkismetLogo className="masterbar__akismet-wordmark" /> }
				<span className="masterbar__secure-checkout-text">{ translate( 'Secure checkout' ) }</span>
			</div>
			{ title && <Item className="masterbar__item-title">{ title }</Item> }
			<ChatButton
				chatIntent="PRESALES"
				initialMessage={ initialMessage }
				siteUrl={ siteSlug }
				className="masterbar__item"
				onClick={ handleClick }
			>
				<MaterialIcon icon="chat_bubble" />
			</ChatButton>
			{ loadHelpCenterIcon && <DefaultMasterbarContact /> }
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
