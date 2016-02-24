/**
 * External dependencies
 */
import React from 'react';

const CheckoutThankYouHeader = React.createClass( {
	propTypes: {
		isDataLoaded: React.PropTypes.bool.isRequired,
		isFreeTrial: React.PropTypes.bool.isRequired,
		productName: React.PropTypes.string
	},

	renderHeading() {
		if ( ! this.props.isDataLoaded ) {
			return this.translate( 'Loading…' );
		} else if ( this.props.isFreeTrial ) {
			return this.translate( 'Your 14 day free trial starts today!' );
		}

		return this.translate( 'Thank you for your purchase!' );
	},

	renderText() {
		if ( ! this.props.isDataLoaded ) {
			return this.translate( 'Loading…' );
		} else if ( this.props.productName ) {
			if ( this.props.isFreeTrial ) {
				return this.translate( "We hope you enjoy %(productName)s. What's next? Take it for a spin!", {
					args: {
						productName: this.props.productName
					}
				} );
			} else {
				return this.translate(
					"You will receive an email confirmation shortly for your purchase of %(productName)s. What's next?", {
						args: {
							productName: this.props.productName
						}
					}
				);
			}
		}

		return this.translate( "You will receive an email confirmation shortly. What's next?" );
	},

	render() {
		return (
			<div className="checkout-thank-you-header">
				<span className="checkout-thank-you-header__icon"/>
				<h1 className="checkout-thank-you-header__heading">
					{ this.renderHeading() }
				</h1>
				<h2 className="checkout-thank-you-header__text">
					{ this.renderText() }
				</h2>
			</div>
		);
	}
} );

export default CheckoutThankYouHeader;
