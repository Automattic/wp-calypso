/**
 * External dependencies
 */
import React from 'react';

const CheckoutThankYouHeader = React.createClass( {
	propTypes: {
		isDataLoaded: React.PropTypes.bool.isRequired,
		isFreeTrial: React.PropTypes.bool.isRequired,
		productName: React.PropTypes.string.isRequired
	},

	renderHeading() {
		let heading = this.translate( 'Thank you for your purchase!' );

		if ( ! this.props.isDataLoaded ) {
			heading = this.translate( 'Loading…' );
		} else if ( this.props.isFreeTrial ) {
			heading = this.translate( 'Your 14 day free trial starts today!' );
		}

		return (
			<h1 className="checkout-thank-you-header__heading">
				{ heading }
			</h1>
		);
	},

	renderText: function() {
		let text = this.translate( "You will receive an email confirmation shortly. What's next?" );

		if ( ! this.props.isDataLoaded ) {
			text = this.translate( 'Loading…' );
		} else if ( this.props.productName ) {
			if ( this.props.isFreeTrial ) {
				text = this.translate( "We hope you enjoy %(productName)s. What's next? Take it for a spin!", {
					args: {
						productName: this.props.productName
					}
				} );
			} else {
				text = this.translate(
					"You will receive an email confirmation shortly for your purchase of %(productName)s. What's next?", {
						args: {
							productName: this.props.productName
						}
					}
				);
			}
		}

		return (
			<h2 className="checkout-thank-you-header__text">
				{ text }
			</h2>
		);
	},

	render() {
		return (
			<div className="checkout-thank-you-header">
				<span className="checkout-thank-you-header__icon"></span>
				{ this.renderHeading() }
				{ this.renderText() }
			</div>
		);
	}
} );

export default CheckoutThankYouHeader;
