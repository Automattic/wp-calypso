/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { reject } from 'lodash';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartBody from './cart-body';
import CartBodyLoadingPlaceholder from './cart-body/loading-placeholder';
import CartMessages from './cart-messages';
import HeaderButton from 'components/header-button';
import CartButtons from './cart-buttons';
import Count from 'components/count';
import Popover from 'components/popover';
import CartEmpty from './cart-empty';
import { isCredits } from 'lib/products-values';
import TrackComponentView from 'lib/analytics/track-component-view';

/**
 * Style dependencies
 */
import './style.scss';

class PopoverCart extends React.Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		onToggle: PropTypes.func.isRequired,
		closeSectionNavMobilePanel: PropTypes.func,
		visible: PropTypes.bool.isRequired,
		pinned: PropTypes.bool.isRequired,
	};

	toggleButtonRef = React.createRef();
	hasUnmounted = false;

	componentWillUnmount() {
		this.hasUnmounted = true;
	}

	itemCount() {
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return;
		}

		return reject( this.props.cart.products, isCredits ).length;
	}

	onToggle = () => {
		this.props.closeSectionNavMobilePanel();
		this.props.onToggle();
	};

	onClose = () => {
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
	};

	render() {
		const { cart, selectedSite } = this.props;
		let countBadge;
		const classes = classNames( 'popover-cart', {
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
<<<<<<< HEAD
					<HeaderButton icon="cart" label="Cart" onClick={ this.onToggle } />

					<button
						className="cart-toggle-button"
						ref={ this.toggleButtonRef }
=======
					<HeaderButton
						icon="cart"
						label={ translate( 'Cart' ) }
						ref={ this.toggleButton }
>>>>>>> Replaces button element w/ HeaderButton component
						onClick={ this.onToggle }
					/>
					{ countBadge }
				</div>

				{ this.renderCartContent() }
			</div>
		);
	}

	renderCartContent() {
		if ( ! this.props.pinned ) {
			return (
				<Popover
					className="popover-cart__popover popover"
					isVisible={ this.props.visible }
					position="bottom left"
					onClose={ this.onClose }
					context={ this.toggleButtonRef.current }
				>
					{ this.renderCartBody() }
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
					{ this.renderCartBody() }
					<TrackComponentView
						eventName="calypso_popover_cart_content_impression"
						eventProperties={ { style: 'mobile-cart' } }
					/>
				</div>
			);
		}
	}

	renderCartBody() {
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return <CartBodyLoadingPlaceholder />;
		}

		if ( ! this.props.cart.products.length ) {
			return <CartEmpty selectedSite={ this.props.selectedSite } path={ this.props.path } />;
		}

		return (
			<div>
				<CartBody collapse cart={ this.props.cart } selectedSite={ this.props.selectedSite } />
				<CartButtons selectedSite={ this.props.selectedSite } />
			</div>
		);
	}
}

export default localize( PopoverCart );
