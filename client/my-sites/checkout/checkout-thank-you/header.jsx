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
		primaryCta: PropTypes.func,
	};

	getHeading() {
		const { translate, isDataLoaded, hasFailedPurchases, primaryPurchase } = this.props;

		if ( ! isDataLoaded ) {
			return this.props.translate( 'Loading…' );
		}

		if ( hasFailedPurchases ) {
			return translate( 'Some items failed.' );
		}

		if (
			primaryPurchase &&
			isDomainMapping( primaryPurchase ) &&
			! primaryPurchase.isRootDomainWithUs
		) {
			return preventWidows( translate( 'Almost done!' ) );
		}

		if ( primaryPurchase && isChargeback( primaryPurchase ) ) {
			return translate( 'Thank you!' );
		}

		if ( primaryPurchase && isDelayedDomainTransfer( primaryPurchase ) ) {
			return preventWidows( translate( 'Almost done!' ) );
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
			if ( primaryPurchase.isRootDomainWithUs ) {
				return translate(
					'Your domain {{strong}}%(domain)s{{/strong}} was added to your site. ' +
						'We have set everything up for you, but it may take a little while to start working.',
					{
						args: {
							domain: primaryPurchase.meta,
						},
						components: {
							strong: <strong />,
						},
					}
				);
			}

			return translate(
				'Follow the instructions below to finish setting up your domain {{strong}}%(domainName)s{{/strong}}.',
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
				'Your domain {{strong}}%(domain)s{{/strong}} was added to your site, but ' +
					'the transfer process can take up to 5 days to complete.',
				{
					args: {
						domain: primaryPurchase.meta,
					},
					components: {
						strong: <strong />,
					},
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

		const { primaryPurchase, selectedSite, primaryCta } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_view_site', {
			product: primaryPurchase.productName,
		} );

		if ( primaryCta ) {
			return primaryCta();
		}

		window.location.href = selectedSite.URL;
	};

	startTransfer = event => {
		event.preventDefault();

		const { primaryPurchase, selectedSite } = this.props;

		this.props.recordStartTransferClickInThankYou( primaryPurchase.meta );

		page( domainManagementTransferInPrecheck( selectedSite.slug, primaryPurchase.meta ) );
	};

	getButtonText = () => {
		const { translate, hasFailedPurchases, primaryPurchase } = this.props;
		const site = this.props.selectedSite.slug;

		if ( ! site && hasFailedPurchases ) {
			return translate( 'Register domain' );
		}

		if ( isPlan( primaryPurchase ) ) {
			return translate( 'View my plan' );
		}

		if (
			isDomainRegistration( primaryPurchase ) ||
			isDomainTransfer( primaryPurchase ) ||
			isSiteRedirect( primaryPurchase )
		) {
			return translate( 'Manage domain' );
		}

		if ( isGoogleApps( primaryPurchase ) ) {
			return translate( 'Manage email' );
		}

		return translate( 'Go to My Site' );
	};

	getButton() {
		const { hasFailedPurchases, translate, primaryPurchase, selectedSite } = this.props;
		const headerButtonClassName = 'button is-primary';

		if ( hasFailedPurchases || ! primaryPurchase || ! selectedSite || selectedSite.jetpack ) {
			return null;
		}

		if ( isDelayedDomainTransfer( primaryPurchase ) ) {
			return (
				<div className="checkout-thank-you__header-button">
					<button className={ headerButtonClassName } onClick={ this.startTransfer }>
						{ translate( 'Start domain transfer' ) }
					</button>
				</div>
			);
		}

		return (
			<div className="checkout-thank-you__header-button">
				<button className={ headerButtonClassName } onClick={ this.visitSite }>
					{ this.getButtonText() }
				</button>
			</div>
		);
	}

	render() {
		const { isDataLoaded, hasFailedPurchases, primaryPurchase } = this.props;
		const classes = { 'is-placeholder': ! isDataLoaded };

		let svg = 'thank-you.svg';
		if ( hasFailedPurchases ) {
			svg = 'items-failed.svg';
		} else if (
			primaryPurchase &&
			( ( isDomainMapping( primaryPurchase ) && ! primaryPurchase.isRootDomainWithUs ) ||
				isDelayedDomainTransfer( primaryPurchase ) )
		) {
			svg = 'publish-button.svg';
		} else if ( primaryPurchase && isDomainTransfer( primaryPurchase ) ) {
			svg = 'check-emails-desktop.svg';
		}

		return (
			<div className={ classNames( 'checkout-thank-you__header', classes ) }>
				<div className="checkout-thank-you__header-icon">
					<img src={ `/calypso/images/upgrades/${ svg }` } alt="" />
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

export default connect(
	null,
	{
		recordStartTransferClickInThankYou,
		recordTracksEvent,
	}
)( localize( CheckoutThankYouHeader ) );
