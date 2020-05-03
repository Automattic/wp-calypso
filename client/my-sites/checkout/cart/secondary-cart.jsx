/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CartBody from './cart-body';
import CartFreeUserPlanUpsell from 'my-sites/checkout/cart/cart-free-user-plan-upsell';
import CartMessages from './cart-messages';
import CartSummaryBar from './cart-summary-bar';
import CartPlanAdTheme from './cart-plan-ad-theme';
import CartPlanDiscountAd from './cart-plan-discount-ad';
import CartBodyLoadingPlaceholder from './cart-body/loading-placeholder';
import scrollIntoViewport from 'lib/scroll-into-viewport';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import { isShowingCartOnMobile } from 'state/ui/checkout/selectors';
import JetpackLogo from 'components/jetpack-logo';

/**
 * Style dependencies
 */
import './style.scss';

class SecondaryCart extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	};

	cartBodyRef = React.createRef();

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.isShowingOnMobile && this.props.isShowingOnMobile ) {
			scrollIntoViewport( this.cartBodyRef.current, {
				behavior: 'smooth',
				scrollMode: 'if-needed',
			} );
		}
	}

	render() {
		const { cart, selectedSite, isJetpackNotAtomic, isShowingOnMobile } = this.props;

		const cartClasses = classNames( 'secondary-cart', {
			'secondary-cart__hidden': ! isShowingOnMobile,
		} );

		if ( ! cart.hasLoadedFromServer ) {
			return (
				<div className={ cartClasses }>
					<ul className="secondary-cart__item">
						<CartMessages cart={ cart } selectedSite={ selectedSite } />
						<CartSummaryBar additionalClasses="cart-header" />
						<CartBodyLoadingPlaceholder />
					</ul>
				</div>
			);
		}

		return (
			<div className={ cartClasses }>
				<ul className="secondary-cart__item">
					<CartMessages cart={ cart } selectedSite={ selectedSite } />
					<CartSummaryBar additionalClasses="cart-header" />
					<CartPlanAdTheme selectedSite={ selectedSite } cart={ cart } />
					<CartBody
						ref={ this.cartBodyRef }
						cart={ cart }
						selectedSite={ selectedSite }
						showCoupon={ true }
					/>
					<CartPlanDiscountAd cart={ cart } selectedSite={ selectedSite } />

					{ isJetpackNotAtomic && <JetpackLogo full /> }
				</ul>

				<ul className="secondary-cart__item">
					<CartFreeUserPlanUpsell cart={ cart } />
				</ul>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		isJetpackNotAtomic:
			isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId ),
		isShowingOnMobile: isShowingCartOnMobile( state ),
	};
} )( localize( SecondaryCart ) );
