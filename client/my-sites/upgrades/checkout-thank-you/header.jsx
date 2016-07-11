/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import {
	isChargeback,
	isDomainMapping,
	isDomainRegistration,
	isGoogleApps,
	isGuidedTransfer,
	isPlan,
	isSiteRedirect
} from 'lib/products-values';
import Gridicon from 'components/gridicon';

const CheckoutThankYouHeader = React.createClass( {
	propTypes: {
		isDataLoaded: React.PropTypes.bool.isRequired,
		primaryPurchase: React.PropTypes.object
	},

	getHeading() {
		if ( ! this.props.isDataLoaded ) {
			return this.translate( 'Loading…' );
		}

		if ( this.props.primaryPurchase && isChargeback( this.props.primaryPurchase ) ) {
			return this.translate( 'Thank you!' );
		}

		return this.translate( 'Thank you for your purchase!' );
	},

	getText() {
		if ( ! this.props.isDataLoaded || ! this.props.primaryPurchase ) {
			return this.translate( 'You will receive an email confirmation shortly.' );
		}

		if ( isPlan( this.props.primaryPurchase ) ) {
			return this.translate(
				'Your site is now on the {{strong}}%(productName)s{{/strong}} plan. ' +
				"It's doing somersaults in excitement!", {
					args: { productName: this.props.primaryPurchase.productName },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isDomainRegistration( this.props.primaryPurchase ) ) {
			return this.translate(
				'Your new domain {{strong}}%(domainName)s{{/strong}} is ' +
				'being set up. Your site is doing somersaults in excitement!', {
					args: { domainName: this.props.primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isDomainMapping( this.props.primaryPurchase ) ) {
			return this.translate(
				'Your domain {{strong}}%(domainName)s{{/strong}} was added to your site. ' +
				"But it isn't working yet – follow the instructions below to complete the set up.", {
					args: { domainName: this.props.primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isGoogleApps( this.props.primaryPurchase ) ) {
			return this.translate(
				'Your domain {{strong}}%(domainName)s{{/strong}} is now set up to use Google Apps. ' +
				"It's doing somersaults in excitement!", {
					args: { domainName: this.props.primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isGuidedTransfer( this.props.primaryPurchase ) ) {
			if ( typeof this.props.primaryPurchase.meta === 'string' ) {
				return this.translate( 'The guided transfer for {{strong}}%(siteName)s{{/strong}} ' +
					'will begin very soon. We will be in touch with you via email.', {
						args: { siteName: this.props.primaryPurchase.meta },
						components: { strong: <strong /> },
					}
				);
			}

			return this.translate( 'The guided transfer for your site will ' +
				'begin very soon. We will be in touch with you via email.', {
					components: { strong: <strong /> },
				}
			);
		}

		if ( isSiteRedirect( this.props.primaryPurchase ) ) {
			return this.translate(
				'Your site is now redirecting to {{strong}}%(domainName)s{{/strong}}. ' +
				"It's doing somersaults in excitement!", {
					args: { domainName: this.props.primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isChargeback( this.props.primaryPurchase ) ) {
			return this.translate( 'Your chargeback fee is paid. Your site is doing somersaults in excitement!' );
		}

		return this.translate(
			"You will receive an email confirmation shortly for your purchase of {{strong}}%(productName)s{{/strong}}. What's next?", {
				args: {
					productName: this.props.primaryPurchase.productName
				},
				components: {
					strong: <strong />
				}
			}
		);
	},

	render() {
		const classes = {
			'checkout-thank-you__header': true,
			'is-placeholder': ! this.props.isDataLoaded
		};

		return (
			<div className={ classNames( classes ) }>
				<div className="checkout-thank-you__header-content">
					<span className="checkout-thank-you__header-icon">
						<Gridicon icon="trophy" size={ 72 } />
					</span>

					<div className="checkout-thank-you__header-copy">
						<h1 className="checkout-thank-you__header-heading">
							{ this.getHeading() }
						</h1>

						<h2 className="checkout-thank-you__header-text">
							{ this.getText() }
						</h2>
					</div>
				</div>
			</div>
		);
	}
} );

export default CheckoutThankYouHeader;
