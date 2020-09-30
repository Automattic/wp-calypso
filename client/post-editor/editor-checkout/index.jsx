/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import wp from '../../lib/wp';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import CompositeCheckout from '../../my-sites/checkout/composite-checkout/composite-checkout';
import { getSelectedSite } from 'state/ui/selectors';
import { fetchStripeConfiguration } from '../../my-sites/checkout/composite-checkout/payment-method-helpers';
import { StripeHookProvider } from 'lib/stripe';

/**
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

class EditorCheckout extends Component {
	static propTypes = {
		site: PropTypes.object,
		isOpen: PropTypes.boolean,
		onClose: PropTypes.func,
	};

	static defaultProps = {
		isOpen: false,
		onClose: () => {},
	};

	render() {
		const { site, isOpen, onClose } = this.props;

		const getCart = async () => {
			const planProduct = {
				product_id: 1009,
				product_slug: 'personal-bundle',
			};

			let cart = await wpcom.getCart( site.slug );

			cart = await wpcom.setCart( site.ID, {
				...cart,
				products: [ ...cart.products, planProduct ],
			} );

			return cart;
		};

		return (
			<div className={ classnames( 'editor-checkout', isOpen ? 'is-open' : '' ) }>
				<button type="button" className="editor-checkout__close-button" onClick={ onClose }>
					[X] Close Sidebar
				</button>
				<StripeHookProvider fetchStripeConfiguration={ fetchStripeConfigurationWpcom }>
					<CompositeCheckout
						isInEditor={ true }
						siteId={ site.ID }
						siteSlug={ site.slug }
						getCart={ getCart }
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
} ) )( EditorCheckout );
