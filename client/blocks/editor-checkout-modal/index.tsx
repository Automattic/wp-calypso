/**
 * External dependencies
 */
import PropTypes from 'prop-types';
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

class EditorCheckoutModal extends Component {
	static propTypes = {
		site: PropTypes.object,
		isOpen: PropTypes.bool,
		onClose: PropTypes.func,
		cartData: PropTypes.object,
	};

	static defaultProps = {
		isOpen: false,
		onClose: () => {},
		cartData: {},
	};

	async getCart() {
		// Important: If getCart or cartData is empty, it will redirect to the plans page in customer home.
		return await wpcom.setCart( this.props.site.ID, this.props.cartData );
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

function fetchStripeConfigurationWpcom( args ) {
	return fetchStripeConfiguration( args, wpcom );
}

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( EditorCheckoutModal );
