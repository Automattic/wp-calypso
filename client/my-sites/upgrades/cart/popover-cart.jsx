/**
 * External dependencies
 */
import React from 'react';
import reject from 'lodash/reject';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CartBody from './cart-body';
import CartBodyLoadingPlaceholder from './cart-body/loading-placeholder';
import CartMessagesMixin from './cart-messages-mixin';
import CartButtons from './cart-buttons';
import Popover from 'components/popover';
import CartEmpty from './cart-empty';
import CartPlanAd from './cart-plan-ad';
import CartTrialAd from './cart-trial-ad';
import { isCredits } from 'lib/products-values';
import Gridicon from 'components/gridicon';

var PopoverCart = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		onToggle: React.PropTypes.func.isRequired,
		closeSectionNavMobilePanel: React.PropTypes.func,
		visible: React.PropTypes.bool.isRequired,
		pinned: React.PropTypes.bool.isRequired,
		showKeepSearching: React.PropTypes.bool.isRequired,
		onKeepSearchingClick: React.PropTypes.func.isRequired
	},

	itemCount: function() {
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return;
		}

		return reject( this.props.cart.products, isCredits ).length;
	},

	mixins: [ CartMessagesMixin ],

	render: function() {
		var countBadge,
			classes = classNames( {
				'popover-cart': true,
				pinned: this.props.pinned
			} );

		if ( this.itemCount() ) {
			countBadge = <div className="popover-cart__count-badge">{ this.itemCount() }</div>;
		}

		return (
			<div>
				<div className={ classes }>
					<button className="cart-toggle-button"
							ref="toggleButton"
							onClick={ this.onToggle }>
						<div className="popover-cart__label">{ this.translate( 'Cart' ) }</div>
						<Gridicon icon='cart' size={ 24 } />
						{ countBadge }
					</button>
				</div>

				{ this.cartContent() }
			</div>
		);
	},

	cartContent: function() {
		if ( ! this.props.pinned ) {
			return (
				<Popover className="popover-cart__popover popover"
						isVisible={ this.props.visible }
						position="bottom left"
						onClose={ this.onClose }
						context={ this.refs.toggleButton }>
					{ this.cartBody() }
				</Popover>
			);
		}
		if ( this.props.visible ) {
			return (
				<div className="popover-cart__mobile-cart">
					<div className="top-arrow"></div>
					{ this.cartBody() }
				</div>
			);
		}
	},

	onToggle: function( event ) {
		this.props.closeSectionNavMobilePanel();
		this.props.onToggle( event );
	},

	cartBody: function() {
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return <CartBodyLoadingPlaceholder />;
		}

		if ( ! this.props.cart.products.length ) {
			return (
				<CartEmpty selectedSite={ this.props.selectedSite } path={ this.props.path } />
			);
		}

		return (
			<div>
				<CartTrialAd
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite }
					sitePlans={ this.props.sitePlans } />

				<CartPlanAd
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite } />

				<CartBody
					collapse={ true }
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite } />

				<CartButtons
					selectedSite={ this.props.selectedSite }
					showKeepSearching={ this.props.showKeepSearching }
					onKeepSearchingClick={ this.props.onKeepSearchingClick }
					/>
			</div>
		);
	},

	onClose: function() {
		// Since this callback can fire after the user navigates off the page, we
		// we need to check if it's mounted to prevent errors.
		if ( ! this.isMounted() ) {
			return;
		}

		// if the cart became pinned, ignore close event from Popover
		if ( this.props.pinned ) {
			return;
		}

		this.onToggle();
	}
} );

module.exports = PopoverCart;
