/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { reject } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import CartBody from './cart-body';
import CartBodyLoadingPlaceholder from './cart-body/loading-placeholder';
import CartMessages from './cart-messages';
import CartButtons from './cart-buttons';
import Count from 'components/count';
import Popover from 'components/popover';
import CartEmpty from './cart-empty';
import CartPlanAd from './cart-plan-ad';
import { isCredits } from 'lib/products-values';
import TrackComponentView from 'lib/analytics/track-component-view';

/**
 * Style dependencies
 */
import './style.scss';

// eslint-disable-next-line react/prefer-es6-class
const PopoverCart = createReactClass( {
	displayName: 'PopoverCart',

	propTypes: {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		onToggle: PropTypes.func.isRequired,
		closeSectionNavMobilePanel: PropTypes.func,
		visible: PropTypes.bool.isRequired,
		pinned: PropTypes.bool.isRequired,
	},

	toggleButton: React.createRef(),
	hasUnmounted: false,

	componentWillUnmount: function() {
		this.hasUnmounted = true;
	},

	itemCount: function() {
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return;
		}

		return reject( this.props.cart.products, isCredits ).length;
	},

	render: function() {
		const { cart, selectedSite } = this.props;
		let countBadge;
		const classes = classNames( {
			'popover-cart': true,
			pinned: this.props.pinned,
		} );

		if ( this.itemCount() ) {
			countBadge = (
				<div className="cart__count-badge count-badge-pulsing">
					<Count primary count={ this.itemCount() } />
					<TrackComponentView eventName="calypso_popover_cart_badge_impression" />
				</div>
			);
		}

		return (
			<div>
				<CartMessages cart={ cart } selectedSite={ selectedSite } />
				<div className={ classes }>
					<button
						className="cart-toggle-button"
						ref={ this.toggleButton }
						onClick={ this.onToggle }
					>
						<div className="popover-cart__label">{ this.props.translate( 'Cart' ) }</div>
						<Gridicon icon="cart" size={ 24 } />
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
				<Popover
					className="popover-cart__popover popover"
					isVisible={ this.props.visible }
					position="bottom left"
					onClose={ this.onClose }
					context={ this.toggleButton.current }
				>
					{ this.cartBody() }
					<TrackComponentView
						eventName="calypso_popover_cart_content_impression"
						eventProperties={ { style: 'popover' } }
					/>
				</Popover>
			);
		}
		if ( this.props.visible ) {
			return (
				<div className="popover-cart__mobile-cart">
					<div className="top-arrow" />
					{ this.cartBody() }
					<TrackComponentView
						eventName="calypso_popover_cart_content_impression"
						eventProperties={ { style: 'mobile-cart' } }
					/>
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
			return <CartEmpty selectedSite={ this.props.selectedSite } path={ this.props.path } />;
		}

		return (
			<div>
				<CartPlanAd cart={ this.props.cart } selectedSite={ this.props.selectedSite } />

				<CartBody
					collapse={ true }
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite }
				/>

				<CartButtons selectedSite={ this.props.selectedSite } />
			</div>
		);
	},

	onClose: function() {
		// Since this callback can fire after the user navigates off the page, we
		// we need to check if it's mounted to prevent errors.
		if ( this.hasUnmounted ) {
			return;
		}

		// if the cart became pinned, ignore close event from Popover
		if ( this.props.pinned ) {
			return;
		}

		this.onToggle();
	},
} );

export default localize( PopoverCart );
