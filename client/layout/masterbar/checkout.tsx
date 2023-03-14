import { WordPressWordmark } from '@automattic/components';
import { checkoutTheme, CheckoutModal } from '@automattic/composite-checkout';
import { HelpCenter } from '@automattic/data-stores';
import { HelpIcon } from '@automattic/help-center';
import { useShoppingCart } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import {
	useSelect as useDataStoreSelect,
	useDispatch as useDataStoreDispatch,
} from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useValidCheckoutBackUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-valid-checkout-back-url';
import { leaveCheckout } from 'calypso/my-sites/checkout/composite-checkout/lib/leave-checkout';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import Item from './item';
import Masterbar from './masterbar';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

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
	const jetpackCheckoutBackUrl = useValidCheckoutBackUrl( siteSlug );

	const isJetpackCheckout = window.location.pathname.startsWith( '/checkout/jetpack' );
	const isJetpack = isJetpackCheckout || isJetpackNotAtomic;
	const cartKey = useCartKey();
	const { responseCart, replaceProductsInCart } = useShoppingCart( cartKey );
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const isShowingHelpCenter = useDataStoreSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);

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

	const showCloseButton = isLeavingAllowed && ! isJetpack;

	return (
		<Masterbar
			className={ classnames( 'masterbar--is-checkout', { 'masterbar--is-jetpack': isJetpack } ) }
		>
			<div className="masterbar__secure-checkout">
				{ showCloseButton && (
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
			{ title && <Item className="masterbar__item-title">{ title }</Item> }
			{ loadHelpCenterIcon && (
				<Item
					onClick={ () => setShowHelpCenter( ! isShowingHelpCenter ) }
					className={ classnames( 'masterbar__item-help', {
						'is-active': isShowingHelpCenter,
					} ) }
					icon={ <HelpIcon /> }
				>
					{ translate( 'Help' ) }
				</Item>
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
