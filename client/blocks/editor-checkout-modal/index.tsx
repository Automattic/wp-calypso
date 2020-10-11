/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import wp from 'lib/wp';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { StripeHookProvider } from 'lib/stripe';
import { fetchStripeConfiguration } from 'my-sites/checkout/composite-checkout/payment-method-helpers';
import CompositeCheckout from 'my-sites/checkout/composite-checkout/composite-checkout';
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

interface CartData {
	products: Array< {
		product_id: number;
		product_slug: string;
	} >;
}

type Props = {
	site: object;
	cartData: CartData;
	onClose: () => void;
	isOpen: boolean;
};

class EditorCheckoutModal extends Component< Props > {
	static defaultProps = {
		isOpen: false,
		onClose: () => null,
		cartData: {},
	};

	async getCart() {
		// Important: If getCart or cartData is empty, it will redirect to the plans page in customer home.
		const { site, cartData } = this.props;

		try {
			return await wpcom.setCart( site.ID, cartData );
		} catch {
			return;
		}
	}

	render() {
		const { site, isOpen, onClose, cartData } = this.props;

		const hasEmptyCart = ! cartData.products || cartData.products.length < 1;

		return hasEmptyCart ? null : (
			<div className={ classnames( 'editor-checkout-modal', isOpen ? 'is-open' : '' ) }>
				<button type="button" className="editor-checkout-modal__close-button" onClick={ onClose }>
					[X] Close Sidebar
				</button>
				<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfigurationWpcom }>
					<CompositeCheckout
						siteId={ site.ID }
						siteSlug={ site.slug }
						getCart={ this.getCart.bind( this ) }
					/>
				</StripeHookProvider>
			</div>
		);
	}
}

function fetchStripeConfigurationWpcom( args: object ) {
	return fetchStripeConfiguration( args, wpcom );
}

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( EditorCheckoutModal );
