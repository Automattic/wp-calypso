/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import {
	isChargeback,
	isDelayedDomainTransfer,
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGoogleApps,
	isGuidedTransfer,
	isPlan,
	isSiteRedirect,
} from 'lib/products-values';
import { recordTracksEvent } from 'state/analytics/actions';
import { localize } from 'i18n-calypso';
import { preventWidows } from 'lib/formatting';
import { domainManagementTransferInPrecheck } from 'my-sites/domains/paths';
import { recordStartTransferClickInThankYou } from 'state/domains/actions';

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

		if ( primaryPurchase && isDomainTransfer( primaryPurchase ) ) {
			if ( isDelayedDomainTransfer( primaryPurchase ) ) {
				return preventWidows( translate( 'Almost done!' ) );
			}

			return preventWidows(
				translate( 'Check your email! There are important next steps waiting in your inbox.' )
			);
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
					"It's doing somersaults in excitement!",
				{
					args: { productName: primaryPurchase.productName },
					components: { strong: <strong /> },
				}
			);
		}

		if ( isDomainRegistration( primaryPurchase ) ) {
			return translate(
				'Your new domain {{strong}}%(domainName)s{{/strong}} is ' +
					'being set up. Your site is doing somersaults in excitement!',
				{
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> },
				}
			);
		}

		if ( isDomainMapping( primaryPurchase ) ) {
			return translate(
				'Your domain {{strong}}%(domainName)s{{/strong}} was added to your site. ' +
					'It may take a little while to start working – see below for more information.',
				{
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> },
				}
			);
		}

		if ( isGoogleApps( primaryPurchase ) ) {
			return translate(
				'Your domain {{strong}}%(domainName)s{{/strong}} is now set up to use G Suite. ' +
					"It's doing somersaults in excitement!",
				{
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> },
				}
			);
		}

		if ( isGuidedTransfer( primaryPurchase ) ) {
			if ( typeof primaryPurchase.meta === 'string' ) {
				return translate(
					'The guided transfer for {{strong}}%(siteName)s{{/strong}} ' +
						'will begin very soon. We will be in touch with you via email.',
					{
						args: { siteName: primaryPurchase.meta },
						components: { strong: <strong /> },
					}
				);
			}

			return translate(
				'The guided transfer for your site will ' +
					'begin very soon. We will be in touch with you via email.',
				{
					components: { strong: <strong /> },
				}
			);
		}

		if ( isSiteRedirect( primaryPurchase ) ) {
			return translate(
				'Your site is now redirecting to {{strong}}%(domainName)s{{/strong}}. ' +
					"It's doing somersaults in excitement!",
				{
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> },
				}
			);
		}

		if ( isDomainTransfer( primaryPurchase ) ) {
			if ( isDelayedDomainTransfer( primaryPurchase ) ) {
				return translate(
					'Your new site is now live, with a temporary domain. Start the transfer to get your domain ' +
						'{{strong}}%(domainName)s{{/strong}} moved to WordPress.com.',
					{
						args: { domainName: primaryPurchase.meta },
						components: { strong: <strong /> },
					}
				);
			}

			return translate(
				'We sent an email with an important link. Please open the email and click the link to confirm ' +
					'that you want to transfer {{strong}}%(domainName)s{{/strong}} to WordPress.com. ' +
					"The transfer can't complete until you do!",
				{
					args: { domainName: primaryPurchase.meta },
					components: { strong: <strong /> },
				}
			);
		}

		if ( isChargeback( primaryPurchase ) ) {
			return translate(
				'Your chargeback fee is paid. Your site is doing somersaults in excitement!'
			);
		}

		return translate(
			"You will receive an email confirmation shortly for your purchase of {{strong}}%(productName)s{{/strong}}. What's next?",
			{
				args: {
					productName: primaryPurchase.productName,
				},
				components: {
					strong: <strong />,
				},
			}
		);
	}

	visitSite = event => {
		event.preventDefault();

		const { primaryPurchase, selectedSite } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_view_site', {
			product: primaryPurchase.productName,
		} );
		window.location.href = selectedSite.URL;
	};

	startTransfer = event => {
		event.preventDefault();

		const { primaryPurchase, selectedSite } = this.props;

		this.props.recordStartTransferClickInThankYou( primaryPurchase.meta );

		page( domainManagementTransferInPrecheck( selectedSite.slug, primaryPurchase.meta ) );
	};

	getButton() {
		const { hasFailedPurchases, translate, primaryPurchase, selectedSite } = this.props;
		const headerButtonClassName = 'button is-primary';

		if ( hasFailedPurchases || ! primaryPurchase || ! selectedSite || selectedSite.jetpack ) {
			return null;
		}

		if ( isPlan( primaryPurchase ) ) {
			return (
				<div className="checkout-thank-you__header-button">
					<button className={ headerButtonClassName } onClick={ this.visitSite }>
						{ translate( 'View your site' ) }
					</button>
				</div>
			);
		}

		if ( isDelayedDomainTransfer( primaryPurchase ) ) {
			return (
				<div className="checkout-thank-you__header-button">
					<button className={ headerButtonClassName } onClick={ this.startTransfer }>
						{ translate( 'Start the domain transfer' ) }
					</button>
				</div>
			);
		}

		return null;
	}

	render() {
		const { isDataLoaded, hasFailedPurchases, primaryPurchase } = this.props;
		const classes = { 'is-placeholder': ! isDataLoaded };

		let svg = 'thank-you.svg';
		if ( hasFailedPurchases ) {
			svg = 'items-failed.svg';
		} else if ( primaryPurchase && isDelayedDomainTransfer( primaryPurchase ) ) {
			svg = 'publish-button.svg';
		} else if ( primaryPurchase && isDomainTransfer( primaryPurchase ) ) {
			svg = 'check-emails-desktop.svg';
		}

		return (
			<div className={ classNames( 'checkout-thank-you__header', classes ) }>
				<div className="checkout-thank-you__header-icon">
					<img src={ `/calypso/images/upgrades/${ svg }` } />
				</div>
				<div className="checkout-thank-you__header-content">
					<div className="checkout-thank-you__header-copy">
						<h1 className="checkout-thank-you__header-heading">{ this.getHeading() }</h1>

						<h2 className="checkout-thank-you__header-text">{ this.getText() }</h2>

						{ this.getButton() }
					</div>
				</div>
			</div>
		);
	}
}

export default connect( null, {
	recordStartTransferClickInThankYou,
	recordTracksEvent,
} )( localize( CheckoutThankYouHeader ) );
