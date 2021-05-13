/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { reject } from 'lodash';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import CartBody from './cart-body';
import CartBodyLoadingPlaceholder from './cart-body/loading-placeholder';
import HeaderButton from 'calypso/components/header-button';
import CartButtons from './cart-buttons';
import Count from 'calypso/components/count';
import Popover from 'calypso/components/popover';
import CartEmpty from './cart-empty';
import { isCredits } from '@automattic/calypso-products';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';

/**
 * Style dependencies
 */
import './style.scss';

class PopoverCart extends React.Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		shoppingCartManager: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		onToggle: PropTypes.func.isRequired,
		visible: PropTypes.bool.isRequired,
		pinned: PropTypes.bool.isRequired,
		compact: PropTypes.bool,
	};

	static defaultProps = {
		compact: false,
	};

	toggleButtonRef = React.createRef();
	hasUnmounted = false;

	componentDidMount() {
		this.props.shoppingCartManager.reloadFromServer();
	}

	componentWillUnmount() {
		this.hasUnmounted = true;
	}

	itemCount() {
		if (
			this.props.shoppingCartManager.isLoading ||
			this.props.shoppingCartManager.isPendingUpdate
		) {
			return;
		}

		return reject( this.props.cart.products, isCredits ).length;
	}

	onToggle = () => {
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
				<div className={ classes }>
					<HeaderButton
						icon="cart"
						compact={ this.props.compact }
						label={ translate( 'Cart' ) }
						ref={ this.toggleButtonRef }
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
		if (
			this.props.shoppingCartManager.isLoading ||
			this.props.shoppingCartManager.isPendingUpdate
		) {
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

export default withShoppingCart( localize( PopoverCart ) );
