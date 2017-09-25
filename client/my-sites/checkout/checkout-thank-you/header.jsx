/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { isChargeback, isDomainMapping, isDomainRegistration, isGoogleApps, isGuidedTransfer, isPlan, isSiteRedirect } from 'lib/products-values';

class CheckoutThankYouHeader extends PureComponent {
	static propTypes = {
		isDataLoaded: PropTypes.bool.isRequired,
		primaryPurchase: PropTypes.object,
		hasFailedPurchases: PropTypes.bool,
	};

	getHeading() {
		const { translate, isDataLoaded, hasFailedPurchases, primaryPurchase } = this.props;

		if ( ! isDataLoaded ) {
			return this.props.translate( 'Loading…' );
		}

		if ( hasFailedPurchases ) {
			return translate( 'Some items failed.' );
		}

		if ( primaryPurchase && isChargeback( primaryPurchase ) ) {
			return translate( 'Thank you!' );
		}

		return translate( 'Congratulations on your purchase!' );
	}

	getText() {
		const { translate, isDataLoaded, hasFailedPurchases, primaryPurchase } = this.props;

		if ( hasFailedPurchases ) {
			return translate( 'Some of the items in your cart could not be added.' );
		}

		if ( ! isDataLoaded || ! primaryPurchase ) {
			return translate( 'You will receive an email confirmation shortly.' );
		}

		if ( isPlan( primaryPurchase ) ) {
			return translate(
				'Your site is now on the {{strong}}%(productName)s{{/strong}} plan. ' +
				"It's doing somersaults in excitement!", {
					args: { productName: primaryPurchase.productName },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isDomainRegistration( primaryPurchase ) ) {
			return translate(
				'Your new domain {{strong}}%(domainName)s{{/strong}} is ' +
				'being set up. Your site is doing somersaults in excitement!', {
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isDomainMapping( primaryPurchase ) ) {
			return translate(
				'Your domain {{strong}}%(domainName)s{{/strong}} was added to your site. ' +
				'It may take a little while to start working – see below for more information.', {
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isGoogleApps( primaryPurchase ) ) {
			return translate(
				'Your domain {{strong}}%(domainName)s{{/strong}} is now set up to use G Suite. ' +
				"It's doing somersaults in excitement!", {
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isGuidedTransfer( primaryPurchase ) ) {
			if ( typeof primaryPurchase.meta === 'string' ) {
				return translate( 'The guided transfer for {{strong}}%(siteName)s{{/strong}} ' +
					'will begin very soon. We will be in touch with you via email.', {
						args: { siteName: primaryPurchase.meta },
						components: { strong: <strong /> },
					}
				);
			}

			return translate( 'The guided transfer for your site will ' +
				'begin very soon. We will be in touch with you via email.', {
					components: { strong: <strong /> },
				}
			);
		}

		if ( isSiteRedirect( primaryPurchase ) ) {
			return translate(
				'Your site is now redirecting to {{strong}}%(domainName)s{{/strong}}. ' +
				"It's doing somersaults in excitement!", {
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> }
				}
			);
		}

		if ( isChargeback( primaryPurchase ) ) {
			return translate( 'Your chargeback fee is paid. Your site is doing somersaults in excitement!' );
		}

		return translate(
			"You will receive an email confirmation shortly for your purchase of {{strong}}%(productName)s{{/strong}}. What's next?", {
				args: {
					productName: primaryPurchase.productName
				},
				components: {
					strong: <strong />
				}
			}
		);
	}

	render() {
		const { isDataLoaded, hasFailedPurchases } = this.props;
		const classes = { 'is-placeholder': ! isDataLoaded };

		return (
			<div className={ classNames( 'checkout-thank-you__header', classes ) }>
				<div className="checkout-thank-you__header-icon">
					<img src={ `/calypso/images/upgrades/${ hasFailedPurchases ? 'items-failed.svg' : 'thank-you.svg' }` } />
				</div>
				<div className="checkout-thank-you__header-content">
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

export default localize( CheckoutThankYouHeader );
