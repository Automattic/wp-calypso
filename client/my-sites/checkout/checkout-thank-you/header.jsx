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
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isGuidedTransfer,
	isPlan,
	isSiteRedirect,
	isTitanMail,
} from '@automattic/calypso-products';
import { isGoogleWorkspaceExtraLicence } from 'calypso/lib/purchases';
import {
	isGSuiteExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from 'calypso/lib/gsuite';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { localize } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';
import {
	domainManagementEdit,
	domainManagementTransferInPrecheck,
} from 'calypso/my-sites/domains/paths';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { recordStartTransferClickInThankYou } from 'calypso/state/domains/actions';
import Gridicon from 'calypso/components/gridicon';
import getCheckoutUpgradeIntent from '../../../state/selectors/get-checkout-upgrade-intent';
import { Button } from '@automattic/components';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { downloadTrafficGuide } from 'calypso/my-sites/marketing/ultimate-traffic-guide';
import { emailManagementEdit } from 'calypso/my-sites/email/paths';

export class CheckoutThankYouHeader extends PureComponent {
	static propTypes = {
		isAtomic: PropTypes.bool,
		siteAdminUrl: PropTypes.string,
		displayMode: PropTypes.string,
		upgradeIntent: PropTypes.string,
		selectedSite: PropTypes.object,
		isDataLoaded: PropTypes.bool.isRequired,
		primaryPurchase: PropTypes.object,
		hasFailedPurchases: PropTypes.bool,
		isSimplified: PropTypes.bool,
		siteUnlaunchedBeforeUpgrade: PropTypes.bool,
		primaryCta: PropTypes.func,
		purchases: PropTypes.array,
		translate: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		recordStartTransferClickInThankYou: PropTypes.func.isRequired,
	};

	getHeading() {
		const { translate, isDataLoaded, hasFailedPurchases, primaryPurchase, purchases } = this.props;

		if ( ! isDataLoaded ) {
			return this.props.translate( 'Loading…' );
		}

		if ( hasFailedPurchases ) {
			return translate( 'Some items failed.' );
		}

		if ( purchases?.length > 0 && purchases[ 0 ].productType === 'search' ) {
			return translate( 'Welcome to Jetpack Search!' );
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
			purchases,
		} = this.props;

		if ( hasFailedPurchases ) {
			return translate( 'Some of the items in your cart could not be added.' );
		}

		if ( purchases?.length > 0 && purchases[ 0 ].productType === 'search' ) {
			return (
				<div>
					<p>{ translate( 'We are currently indexing your site.' ) }</p>
					<p>
						{ translate(
							'In the meantime, we have configured Jetpack Search on your site' +
								' ' +
								'— you should try customizing it in your traditional WordPress dashboard.'
						) }
					</p>
				</div>
			);
		}

		if ( ! isDataLoaded || ! primaryPurchase ) {
			if ( 'concierge' === displayMode ) {
				return translate(
					'You will receive an email confirmation shortly,' +
						' along with detailed instructions to schedule your call with us.'
				);
			}

			if ( 'traffic-guide' === displayMode ) {
				return translate(
					// eslint-disable-next-line inclusive-language/use-inclusive-words
					'{{p}}Congratulations for taking this important step towards mastering the art of online marketing!' +
						' To download your copy of The Ultimate Traffic Guide, simply click the button below and confirm the download prompt.{{/p}}' +
						'{{p}}The Ultimate Traffic Guide is a goldmine of traffic tips and how-tos that reveals the exact “Breakthrough Traffic” process we’ve developed over the past decade.{{/p}}' +
						'{{p}}We’ve done all the hard work for you.' +
						' We’ve sifted through an ocean of marketing articles, tested the ideas to see if they actually work, and then distilled the very best ideas into this printable guide.{{/p}}',
					{
						components: {
							p: <p />,
						},
					}
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

		if (
			isGoogleWorkspaceExtraLicence( primaryPurchase ) ||
			isGSuiteExtraLicenseProductSlug( primaryPurchase.productSlug )
		) {
			return preventWidows(
				translate( 'You will receive an email confirmation shortly for your purchase.' )
			);
		}

		if ( isGSuiteOrGoogleWorkspaceProductSlug( primaryPurchase.productSlug ) ) {
			return preventWidows(
				translate(
					'Your domain {{strong}}%(domainName)s{{/strong}} will be using %(productName)s very soon.',
					{
						args: {
							domainName: primaryPurchase.meta,
							productName: primaryPurchase.productName,
						},
						components: { strong: <strong /> },
						comment:
							'%(productName)s can be either "G Suite" or "Google Workspace Business Starter"',
					}
				)
			);
		}

		if ( isTitanMail( primaryPurchase ) ) {
			return preventWidows(
				translate( 'You will receive an email confirmation shortly for your purchase.' )
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

	visitDomain = ( event ) => {
		event.preventDefault();

		const { primaryPurchase, selectedSite } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_view_site', {
			product: primaryPurchase.productName,
			single_domain: true,
		} );

		page( domainManagementEdit( selectedSite.slug, primaryPurchase.meta ) );
	};

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

	visitEmailManagement = ( event ) => {
		event.preventDefault();
		const { primaryPurchase, selectedSite } = this.props;
		page( emailManagementEdit( selectedSite.slug, primaryPurchase.meta ) );
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

	downloadTrafficGuideHandler = ( event ) => {
		event.preventDefault();

		downloadTrafficGuide();
	};

	startTransfer = ( event ) => {
		event.preventDefault();

		const { primaryPurchase, selectedSite } = this.props;

		this.props.recordStartTransferClickInThankYou( primaryPurchase.meta );

		page( domainManagementTransferInPrecheck( selectedSite.slug, primaryPurchase.meta ) );
	};

	goToCustomizer = ( event ) => {
		event.preventDefault();
		const { siteAdminUrl } = this.props;

		if ( ! siteAdminUrl ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_jetpack_product_thankyou', {
			product_name: 'search',
			value: 'Customizer',
			site: 'wpcom',
		} );

		window.location.href = siteAdminUrl + 'customize.php?autofocus[section]=jetpack_search';
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

		if ( 'traffic-guide' === displayMode ) {
			return translate( 'Click here to download your copy now.' );
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
			return this.isSingleDomainPurchase()
				? translate( 'Manage domain' )
				: translate( 'Manage domains' );
		}

		if (
			isGSuiteOrExtraLicenseOrGoogleWorkspace( primaryPurchase ) ||
			isTitanMail( primaryPurchase )
		) {
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

	isSingleDomainPurchase() {
		const { primaryPurchase, purchases } = this.props;

		return (
			primaryPurchase &&
			isDomainRegistration( primaryPurchase ) &&
			purchases?.filter( isDomainRegistration ).length === 1
		);
	}

	getButtons() {
		const {
			hasFailedPurchases,
			translate,
			primaryPurchase,
			purchases,
			selectedSite,
			displayMode,
			isAtomic,
		} = this.props;
		const headerButtonClassName = 'button is-primary';
		const isConciergePurchase = 'concierge' === displayMode;
		const isTrafficGuidePurchase = 'traffic-guide' === displayMode;
		const isSearch = purchases?.length > 0 && purchases[ 0 ].productType === 'search';

		if ( isSearch ) {
			return (
				<div className="checkout-thank-you__header-button">
					<button className={ headerButtonClassName } onClick={ this.goToCustomizer }>
						{ translate( 'Try Search and customize it now' ) }
					</button>
				</div>
			);
		}

		if (
			! isConciergePurchase &&
			! isTrafficGuidePurchase &&
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

		let clickHandler = this.visitSite;

		if ( isConciergePurchase ) {
			clickHandler = this.visitScheduler;
		} else if ( this.isSingleDomainPurchase() ) {
			clickHandler = this.visitDomain;
		} else if ( isTrafficGuidePurchase ) {
			clickHandler = this.downloadTrafficGuideHandler;
		} else if ( isTitanMail( primaryPurchase ) ) {
			clickHandler = this.visitEmailManagement;
		}

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
				{ messages.map( ( message, i ) => (
					<li key={ i } className="checkout-thank-you__success-message-item">
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
		isAtomic: isAtomicSite( state, ownProps.selectedSite?.ID ),
		siteAdminUrl: getSiteAdminUrl( state, ownProps.selectedSite?.ID ),
	} ),
	{
		recordStartTransferClickInThankYou,
		recordTracksEvent,
	}
)( localize( CheckoutThankYouHeader ) );
