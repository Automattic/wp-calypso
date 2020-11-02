/**
 * External dependencies
 */
import React, { useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import wp from 'calypso/lib/wp';
import { Icon, wordpress } from '@wordpress/icons';
import { ShoppingCartProvider, RequestCart } from '@automattic/shopping-cart';
import { Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { StripeHookProvider } from 'calypso/lib/stripe';
import { fetchStripeConfiguration } from 'calypso/my-sites/checkout/composite-checkout/payment-method-helpers';
import CompositeCheckout from 'calypso/my-sites/checkout/composite-checkout/composite-checkout';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getCartKey from 'calypso/my-sites/checkout/get-cart-key';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import userFactory from 'calypso/lib/user';

/**
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

const wpcomGetCart = ( cartKey: string ) => wpcom.getCart( cartKey );
const wpcomSetCart = ( cartKey: string, requestCart: RequestCart ) =>
	wpcom.setCart( cartKey, requestCart );

function fetchStripeConfigurationWpcom( args: Record< string, unknown > ) {
	return fetchStripeConfiguration( args, wpcom );
}

function removeHashFromUrl(): void {
	try {
		const newUrl = window.location.hash
			? window.location.href.replace( window.location.hash, '' )
			: window.location.href;

		window.history.replaceState( null, '', newUrl );
	} catch {}
}

const EditorCheckoutModal = ( props: Props ) => {
	const { site, isOpen, onClose, cartData } = props;
	const hasEmptyCart = ! cartData.products || cartData.products.length < 1;

	const user = userFactory();
	const isLoggedOutCart = ! user?.get();
	const waitForOtherCartUpdates = false;
	// We can assume if they're accessing the checkout in an editor that they have a site.
	const isNoSiteCart = false;

	const cartKey = useMemo(
		() =>
			getCartKey( {
				selectedSite: site,
				isLoggedOutCart,
				isNoSiteCart,
				waitForOtherCartUpdates,
			} ),
		[ waitForOtherCartUpdates, site, isLoggedOutCart, isNoSiteCart ]
	);

	useEffect( () => {
		return () => {
			// Remove the hash e.g. #step2 from the url
			// when the component is going to unmount.
			removeHashFromUrl();
		};
	}, [] );

	// We need to pass in a comma separated list of product
	// slugs to be set in the cart otherwise we will be
	// redirected to the plans page due to an empty cart
	const productSlugs = hasEmptyCart
		? null
		: cartData.products.map( ( product ) => product.product_slug );
	const commaSeparatedProductSlugs = productSlugs?.join( ',' ) || null;

	return hasEmptyCart ? null : (
		<Modal
			open={ isOpen }
			overlayClassName="editor-checkout-modal"
			onRequestClose={ onClose }
			title=""
			icon={ <Icon icon={ wordpress } size={ 36 } /> }
		>
			<ShoppingCartProvider cartKey={ cartKey } getCart={ wpcomGetCart } setCart={ wpcomSetCart }>
				<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfigurationWpcom }>
					<CompositeCheckout
						isInEditor
						siteId={ site.ID }
						siteSlug={ site.slug }
						productAliasFromUrl={ commaSeparatedProductSlugs }
					/>
				</StripeHookProvider>
			</ShoppingCartProvider>
		</Modal>
	);
};

type Props = {
	site: SiteData;
	cartData: RequestCart;
	onClose: () => void;
	isOpen: boolean;
};

EditorCheckoutModal.defaultProps = {
	isOpen: false,
	onClose: () => null,
	cartData: {},
};

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( EditorCheckoutModal );
