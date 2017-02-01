/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import Gridicon from 'gridicons';

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
import { localize } from 'i18n-calypso';

class CheckoutThankYouHeader extends React.Component {
	getHeading() {
		if ( ! this.props.isDataLoaded ) {
			return this.props.translate( 'Loading…' );
		}

		if ( this.props.hasFailedPurchases ) {
			return this.props.translate( 'Some items failed.' );
		}

		if ( this.props.primaryPurchase && isChargeback( this.props.primaryPurchase ) ) {
			return this.props.translate( 'Thank you!' );
		}

		return this.props.translate( 'Thank you for your purchase!' );
	}

	getText() {
		if ( this.props.hasFailedPurchases ) {
			return this.props.translate( 'Some of the items in your cart could not be added.' );
		}

		if ( ! this.props.isDataLoaded || ! this.props.primaryPurchase ) {
			return this.props.translate( 'You will receive an email confirmation shortly.' );
		}

		if ( isPlan( this.props.primaryPurchase ) ) {
			return this.props.translate(
				'Your site is now on the {{strong}}%(productName)s{{/strong}} plan. ' +
				"It's doing somersaults in excitement!", {
					args: { productName: this.props.primaryPurchase.productName },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isDomainRegistration( this.props.primaryPurchase ) ) {
			return this.props.translate(
				'Your new domain {{strong}}%(domainName)s{{/strong}} is ' +
				'being set up. Your site is doing somersaults in excitement!', {
					args: { domainName: this.props.primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isDomainMapping( this.props.primaryPurchase ) ) {
			return this.props.translate(
				'Your domain {{strong}}%(domainName)s{{/strong}} was added to your site. ' +
				'It may take a little while to start working – see below for more information.', {
					args: { domainName: this.props.primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isGoogleApps( this.props.primaryPurchase ) ) {
			return this.props.translate(
				'Your domain {{strong}}%(domainName)s{{/strong}} is now set up to use G Suite. ' +
				"It's doing somersaults in excitement!", {
					args: { domainName: this.props.primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isGuidedTransfer( this.props.primaryPurchase ) ) {
			if ( typeof this.props.primaryPurchase.meta === 'string' ) {
				return this.props.translate( 'The guided transfer for {{strong}}%(siteName)s{{/strong}} ' +
					'will begin very soon. We will be in touch with you via email.', {
						args: { siteName: this.props.primaryPurchase.meta },
						components: { strong: <strong /> },
					}
				);
			}

			return this.props.translate( 'The guided transfer for your site will ' +
				'begin very soon. We will be in touch with you via email.', {
					components: { strong: <strong /> },
				}
			);
		}

		if ( isSiteRedirect( this.props.primaryPurchase ) ) {
			return this.props.translate(
				'Your site is now redirecting to {{strong}}%(domainName)s{{/strong}}. ' +
				"It's doing somersaults in excitement!", {
					args: { domainName: this.props.primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isChargeback( this.props.primaryPurchase ) ) {
			return this.props.translate( 'Your chargeback fee is paid. Your site is doing somersaults in excitement!' );
		}

		return this.props.translate(
			"You will receive an email confirmation shortly for your purchase of {{strong}}%(productName)s{{/strong}}. What's next?", {
				args: {
					productName: this.props.primaryPurchase.productName
				},
				components: {
					strong: <strong />
				}
			}
		);
	}

	render() {
		const icon = this.props.hasFailedPurchases ? 'notice' : 'trophy',
			classes = {
				'checkout-thank-you__header': true,
				'is-placeholder': ! this.props.isDataLoaded
			};

		return (
			<div className={ classNames( classes ) }>
				<div className="checkout-thank-you__header-content">
					<span className="checkout-thank-you__header-icon">
						<Gridicon icon={ icon } size={ 72 } />
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
}

CheckoutThankYouHeader.propTypes = {
	isDataLoaded: React.PropTypes.bool.isRequired,
	primaryPurchase: React.PropTypes.object,
	hasFailedPurchases: React.PropTypes.bool
};

export default localize( CheckoutThankYouHeader );
