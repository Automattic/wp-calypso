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
import Gridicon from 'components/gridicon';
import getCheckoutUpgradeIntent from '../../../state/selectors/get-checkout-upgrade-intent';
import { Button } from '@automattic/components';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';

export class CheckoutThankYouHeader extends PureComponent {
	static propTypes = {
		isDataLoaded: PropTypes.bool.isRequired,
		primaryPurchase: PropTypes.object,
		hasFailedPurchases: PropTypes.bool,
		isSimplified: PropTypes.bool,
		siteUnlaunchedBeforeUpgrade: PropTypes.bool,
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
		const {
			translate,
			isDataLoaded,
			hasFailedPurchases,
			primaryPurchase,
			displayMode,
		} = this.props;

		if ( hasFailedPurchases ) {
			return translate( 'Some of the items in your cart could not be added.' );
		}

		if ( ! isDataLoaded || ! primaryPurchase ) {
			if ( 'concierge' === displayMode ) {
				return translate(
					'You will receive an email confirmation shortly,' +
						' along with detailed instructions to schedule your call with us.'
				);
			}

			return translate( 'You will receive an email confirmation shortly.' );
		}

		if ( isPlan( primaryPurchase ) ) {
			return preventWidows(
				translate(
					'Your site is now on the {{strong}}%(productName)s{{/strong}} plan. ' +
						"It's doing somersaults in excitement!",
					{
						args: { productName: primaryPurchase.productName },
						components: { strong: <strong /> },
					}
				)
			);
		}

		if ( isDomainRegistration( primaryPurchase ) ) {
			return preventWidows(
				translate(
					'Your new domain {{strong}}%(domainName)s{{/strong}} is ' +
						'being set up. Your site is doing somersaults in excitement!',
					{
						args: { domainName: primaryPurchase.meta },
						components: { strong: <strong /> },
					}
				)
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
			return preventWidows(
				translate(
					'Your domain {{strong}}%(domainName)s{{/strong}} is now set up to use G Suite. ' +
						"It's doing somersaults in excitement!",
					{
						args: { domainName: primaryPurchase.meta },
						components: { strong: <strong /> },
					}
				)
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
			return preventWidows(
				translate(
					'Your site is now redirecting to {{strong}}%(domainName)s{{/strong}}. ' +
						"It's doing somersaults in excitement!",
					{
						args: { domainName: primaryPurchase.meta },
						components: { strong: <strong /> },
					}
				)
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
			return preventWidows(
				translate( 'Your chargeback fee is paid. Your site is doing somersaults in excitement!' )
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

	visitSite = ( event ) => {
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

	visitSiteHostingSettings = ( event ) => {
		event.preventDefault();

		const { selectedSite } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_back_to_hosting' );

		window.location.href = `/hosting-config/${ selectedSite.slug }`;
	};

	visitScheduler = ( event ) => {
		event.preventDefault();
		const { selectedSite } = this.props;

		//Maybe record tracks event

		window.location.href = '/me/concierge/' + selectedSite.slug + '/book';
	};

	startTransfer = ( event ) => {
		event.preventDefault();

		const { primaryPurchase, selectedSite } = this.props;

		this.props.recordStartTransferClickInThankYou( primaryPurchase.meta );

		page( domainManagementTransferInPrecheck( selectedSite.slug, primaryPurchase.meta ) );
	};

	getButtonText = () => {
		const {
			displayMode,
			hasFailedPurchases,
			primaryPurchase,
			selectedSite,
			translate,
			upgradeIntent,
		} = this.props;

		switch ( upgradeIntent ) {
			case 'browse_plugins':
				return translate( 'Continue Browsing Plugins' );
			case 'plugins':
			case 'install_plugin':
				return translate( 'Continue Installing Plugin' );
			case 'themes':
			case 'install_theme':
				return translate( 'Continue Installing Theme' );
		}

		if ( 'concierge' === displayMode ) {
			return translate( 'Schedule my session' );
		}

		if ( ! selectedSite.slug && hasFailedPurchases ) {
			return translate( 'Register domain' );
		}

		if ( isPlan( primaryPurchase ) ) {
			return translate( 'View my new features' );
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

	maybeGetSecondaryButton() {
		const { upgradeIntent, translate } = this.props;

		if ( upgradeIntent === 'hosting' ) {
			return (
				<Button onClick={ this.visitSiteHostingSettings }>
					{ translate( 'Return to Hosting' ) }
				</Button>
			);
		}

		return null;
	}

	getButtons() {
		const {
			hasFailedPurchases,
			translate,
			primaryPurchase,
			selectedSite,
			displayMode,
			isAtomic,
		} = this.props;
		const headerButtonClassName = 'button is-primary';
		const isConciergePurchase = 'concierge' === displayMode;

		if (
			! isConciergePurchase &&
			( hasFailedPurchases ||
				! primaryPurchase ||
				! selectedSite ||
				( selectedSite.jetpack && ! isAtomic ) )
		) {
			return null;
		}

		if ( primaryPurchase && isDelayedDomainTransfer( primaryPurchase ) ) {
			return (
				<div className="checkout-thank-you__header-button">
					<button className={ headerButtonClassName } onClick={ this.startTransfer }>
						{ translate( 'Start domain transfer' ) }
					</button>
				</div>
			);
		}

		const clickHandler = 'concierge' === displayMode ? this.visitScheduler : this.visitSite;

		return (
			<div className="checkout-thank-you__header-button">
				{ this.maybeGetSecondaryButton() }
				<button className={ headerButtonClassName } onClick={ clickHandler }>
					{ this.getButtonText() }
				</button>
			</div>
		);
	}

	render() {
		const { isDataLoaded, isSimplified, hasFailedPurchases, primaryPurchase } = this.props;
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

						{ primaryPurchase && isPlan( primaryPurchase ) && isSimplified ? (
							this.renderSimplifiedContent()
						) : (
							<h2 className="checkout-thank-you__header-text">{ this.getText() }</h2>
						) }

						{ this.props.children }

						{ this.getButtons() }
					</div>
				</div>
			</div>
		);
	}

	renderSimplifiedContent() {
		const { translate, primaryPurchase } = this.props;
		const messages = [
			translate(
				'Your site is now on the {{strong}}%(productName)s{{/strong}} plan. ' +
					'Enjoy your powerful new features!',
				{
					args: { productName: primaryPurchase.productName },
					components: { strong: <strong /> },
				}
			),
		];
		if ( this.props.siteUnlaunchedBeforeUpgrade ) {
			messages.push(
				translate(
					"Your site has been launched. You can share it with the world whenever you're ready."
				)
			);
		}

		if ( messages.length === 1 ) {
			return <h2 className="checkout-thank-you__header-text">{ messages[ 0 ] }</h2>;
		}

		const CHECKMARK_SIZE = 24;
		return (
			<ul className="checkout-thank-you__success-messages">
				{ messages.map( ( message ) => (
					<li className="checkout-thank-you__success-message-item">
						<Gridicon icon="checkmark-circle" size={ CHECKMARK_SIZE } />
						<div>{ preventWidows( message ) }</div>
					</li>
				) ) }
			</ul>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		upgradeIntent: ownProps.upgradeIntent || getCheckoutUpgradeIntent( state ),
		isAtomic: isAtomicSite( state, ownProps.selectedSite.ID ),
	} ),
	{
		recordStartTransferClickInThankYou,
		recordTracksEvent,
	}
)( localize( CheckoutThankYouHeader ) );
