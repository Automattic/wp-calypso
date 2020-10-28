/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import wp from 'calypso/lib/wp';
import classnames from 'classnames';
import { Button } from '@wordpress/components';
import { Icon, close, wordpress } from '@wordpress/icons';
import { ShoppingCartProvider } from '@automattic/shopping-cart';

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
import type { CartData, Props } from './types';

/**
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

async function getCart( site: SiteData, cartData: CartData ) {
	try {
		return await wpcom.setCart( site.ID, cartData );
	} catch {
		return;
	}
}

function fetchStripeConfigurationWpcom( args: Record< string, unknown > ) {
	return fetchStripeConfiguration( args, wpcom );
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

	return hasEmptyCart ? null : (
		<div className={ classnames( 'editor-checkout-modal', isOpen ? 'is-open' : '' ) }>
			<div className="editor-checkout-modal__header">
				<div className="editor-checkout-modal__wp-logo">
					<Icon icon={ wordpress } size={ 36 } />
				</div>
				<Button isLink className="editor-checkout-modal__close-button" onClick={ onClose }>
					<Icon icon={ close } size={ 24 } />
				</Button>
			</div>
			<ShoppingCartProvider
				cartKey={ cartKey }
				getCart={ () => getCart( site, cartData ) }
				setCart={ () => getCart( site, cartData ) }
			>
				<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfigurationWpcom }>
					<CompositeCheckout
						isInEditor
						siteId={ site.ID }
						siteSlug={ site.slug }
						getCart={ () => getCart( site, cartData ) }
					/>
				</StripeHookProvider>
			</ShoppingCartProvider>
		</div>
	);
};

EditorCheckoutModal.defaultProps = {
	isOpen: false,
	onClose: () => null,
	cartData: {},
};

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( EditorCheckoutModal );
