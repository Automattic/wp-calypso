/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
<<<<<<< HEAD
 * External dependencies
 */
import { isPlan } from 'lib/products-values';
=======
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
>>>>>>> Checkout: Thank you: Change the CSS for the header on the thank you page to fit the mockup

const CheckoutThankYouHeader = React.createClass( {
	propTypes: {
		isDataLoaded: React.PropTypes.bool.isRequired,
		isFreeTrial: React.PropTypes.bool,
		primaryPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.object
	},

	getHeading() {
		if ( ! this.props.isDataLoaded ) {
			return this.translate( 'Loading…' );
		}

		if ( this.props.isFreeTrial ) {
			return this.translate( 'Way to go, your 14 day free trial starts now!' );
		}

		return this.translate( 'Thank you for your purchase!' );
	},

	getText() {
		if ( ! this.props.isDataLoaded ) {
			return this.translate( 'Loading…' );
<<<<<<< HEAD
		}

		if ( this.props.primaryPurchase ) {
			if ( isPlan( this.props.primaryPurchase ) ) {
				return this.translate( "Your site is now on the {{strong}}%(productName)s{{/strong}} plan. It's doing somersaults in excitement!", {
					args: { productName: this.props.primaryPurchase.productName },
					components: { strong: <strong /> }
				} );
			}

			return this.translate(
				"You will receive an email confirmation shortly for your purchase of %(productName)s. What's next?", {
					args: {
						productName: this.props.primaryPurchase.productName
=======
		} else if ( this.props.productName ) {
			if ( this.props.isFreeTrial ) {
				return this.translate( "We hope you enjoy {{strong}}%(productName)s{{/strong}}. What's next? Take it for a spin!", {
					args: {
						productName: this.props.productName
					},
					components: {
						strong: <strong/>
					}
				} );
			} else {
				return this.translate(
					"You will receive an email confirmation shortly for your purchase of {{strong}}%(productName)s{{/strong}}. What's next?", {
						args: {
							productName: this.props.productName
						},
						components: {
							strong: <strong/>
						}
>>>>>>> Checkout: Thank you: Change the CSS for the header on the thank you page to fit the mockup
					}
				}
			);
		}

		return this.translate( "You will receive an email confirmation shortly. What's next?" );
	},

	render() {
		const classes = {
			'checkout-thank-you-header': true,
			'is-placeholder': ! this.props.isDataLoaded
		}

		return (
<<<<<<< HEAD
<<<<<<< HEAD
			<div className={ classNames( classes ) }>
				<span className="checkout-thank-you-header__icon" />

				<h1 className="checkout-thank-you-header__heading">
					{ this.getHeading() }
				</h1>

				<h2 className="checkout-thank-you-header__text">
					{ this.getText() }
				</h2>
			</div>
=======
			<CompactCard className={ classNames( classes ) }>
=======
			<div className={ classNames( classes ) }>
>>>>>>> Checkout: Thank you: Clean up padding and font styles.
				<div className="checkout-thank-you-header-content">
					<span className="checkout-thank-you-header__icon">
						<Gridicon icon="trophy" size={ 72 } />
					</span>
					<div>
						<h1 className="checkout-thank-you-header__heading">
							{ this.renderHeading() }
						</h1>
						<h2 className="checkout-thank-you-header__text">
							{ this.renderText() }
						</h2>
					</div>
				</div>
<<<<<<< HEAD
			</CompactCard>
>>>>>>> Checkout: Thank you: Change the CSS for the header on the thank you page to fit the mockup
=======
			</div>
>>>>>>> Checkout: Thank you: Clean up padding and font styles.
		);
	}
} );

export default CheckoutThankYouHeader;
