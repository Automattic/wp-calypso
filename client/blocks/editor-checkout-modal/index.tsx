/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import wp from 'calypso/lib/wp';
import classnames from 'classnames';
import { Button } from '@wordpress/components';
import { Icon, close, wordpress } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { StripeHookProvider } from 'calypso/lib/stripe';
import { fetchStripeConfiguration } from 'calypso/my-sites/checkout/composite-checkout/payment-method-helpers';
import CompositeCheckout from 'calypso/my-sites/checkout/composite-checkout/composite-checkout';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

type Site = {
	ID: number;
	slug: string;
};

export interface CartData {
	products: Array< {
		product_id: number;
		product_slug: string;
	} >;
}

type Props = {
	site: {
		ID: string;
		slug: string;
	};
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
				<div className="editor-checkout-modal__header">
					<div className="editor-checkout-modal__wp-logo">
						<Icon icon={ wordpress } size={ 36 } />
					</div>
					<Button isLink className="editor-checkout-modal__close-button" onClick={ onClose }>
						<Icon icon={ close } size={ 24 } />
					</Button>
				</div>
				<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfigurationWpcom }>
					<CompositeCheckout
						isInEditor
						siteId={ site.ID }
						siteSlug={ site.slug }
						getCart={ this.getCart.bind( this ) }
					/>
				</StripeHookProvider>
			</div>
		);
	}
}

function fetchStripeConfigurationWpcom( args: Record< string, unknown > ) {
	return fetchStripeConfiguration( args, wpcom );
}

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( EditorCheckoutModal );
