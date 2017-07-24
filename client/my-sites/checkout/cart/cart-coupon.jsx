/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	upgradesActions = require( 'lib/upgrades/actions' );

module.exports = React.createClass( {
	displayName: 'CartCoupon',

	getInitialState: function() {
		var coupon = this.props.cart.coupon,
			cartHadCouponBeforeMount = Boolean( this.props.cart.coupon );

		return {
			isCouponFormShowing: cartHadCouponBeforeMount,
			hasSubmittedCoupon: cartHadCouponBeforeMount,
			couponInputValue: coupon,
			userChangedCoupon: false
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! this.state.userChangedCoupon ) {
			this.setState( { couponInputValue: nextProps.cart.coupon } );
		}
	},

	toggleCouponDetails: function( event ) {
		event.preventDefault();

		this.setState( { isCouponFormShowing: ! this.state.isCouponFormShowing } );

		if ( this.state.isCouponFormShowing ) {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Hide Coupon Code Link' );
		} else {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Show Coupon Code Link' );
		}
	},

	applyCoupon: function( event ) {
		event.preventDefault();

		analytics.tracks.recordEvent( 'calypso_checkout_coupon_submit', {
			coupon_code: this.state.couponInputValue
		} );

		this.setState( {
			userChangedCoupon: false,
			hasSubmittedCoupon: true
		} );
		upgradesActions.applyCoupon( this.state.couponInputValue );
	},

	handleCouponInput: function( event ) {
		this.setState( {
			userChangedCoupon: true,
			couponInputValue: event.target.value
		} );
	},

	getToggleLink: function() {
		if ( this.props.cart.total_cost === 0 ) {
			return;
		}

		if ( this.state.hasSubmittedCoupon ) {
			return;
		}

		return (
			<a href="" onClick={ this.toggleCouponDetails }>{ this.translate( 'Have a coupon code?' ) }</a>
		);
	},

	getCouponForm: function() {
		if ( ! this.state.isCouponFormShowing ) {
			return;
		}

		if ( this.state.hasSubmittedCoupon ) {
			return;
		}

		return (
			<form onSubmit={ this.applyCoupon }>
				<input type="text" placeholder={ this.translate( 'Enter Coupon Code', { textOnly: true } ) } onChange={ this.handleCouponInput } value={ this.state.couponInputValue } />
				<button type="submit" className="button">
					{ this.translate( 'Apply' ) }
				</button>
			</form>
		);
	},

	render: function() {
		return (
			<div className="cart-coupon">
				{ this.getToggleLink() }
				{ this.getCouponForm() }
			</div>
		);
	}
} );
