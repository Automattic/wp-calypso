import {
	isChargeback,
	isDelayedDomainTransfer,
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGoogleWorkspaceExtraLicence,
	isGSuiteExtraLicenseProductSlug,
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isPlan,
	isSiteRedirect,
	isTitanMail,
} from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { withI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import { getTitanEmailUrl, hasTitanMailWithUs } from 'calypso/lib/titan';
import { getTitanAppsUrlPrefix } from 'calypso/lib/titan/get-titan-urls';
import {
	domainManagementEdit,
	domainManagementTransferInPrecheck,
} from 'calypso/my-sites/domains/paths';
import { emailManagementEdit } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { recordStartTransferClickInThankYou } from 'calypso/state/domains/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	getJetpackSearchCustomizeUrl,
	getJetpackSearchDashboardUrl,
} from 'calypso/state/sites/selectors';
import getCheckoutUpgradeIntent from '../../../state/selectors/get-checkout-upgrade-intent';
import './style.scss';
import Product from './redesign-v2/sections/Product';
import getHeading from './redesign-v2/sections/get-heading';
import { isBulkDomainTransfer } from './utils';

export class CheckoutThankYouHeader extends PureComponent {
	static propTypes = {
		displayMode: PropTypes.string,
		hasFailedPurchases: PropTypes.bool,
		isAtomic: PropTypes.bool,
		isDataLoaded: PropTypes.bool.isRequired,
		isSimplified: PropTypes.bool,
		primaryCta: PropTypes.func,
		primaryPurchase: PropTypes.object,
		purchases: PropTypes.array,
		recordTracksEvent: PropTypes.func.isRequired,
		recordStartTransferClickInThankYou: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		siteUnlaunchedBeforeUpgrade: PropTypes.bool,
		titanAppsUrlPrefix: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		_n: PropTypes.func.isRequired,
		upgradeIntent: PropTypes.string,
		isRedesignV2: PropTypes.bool,
		currency: PropTypes.string,
	};

	isSearch() {
		const { purchases } = this.props;
		return purchases?.length > 0 && purchases[ 0 ].productType === 'search';
	}

	getText() {
		const {
			translate,
			_n,
			isDataLoaded,
			hasFailedPurchases,
			primaryPurchase,
			displayMode,
			purchases,
		} = this.props;

		if ( hasFailedPurchases ) {
			return translate( 'Some of the items in your cart could not be added.' );
		}

		if ( this.isSearch() ) {
			return (
				<div>
					<p>{ translate( 'We are currently indexing your site.' ) }</p>
					<p>
						{ translate(
							'In the meantime, we have configured Jetpack Search on your site' +
								' ' +
								'— try customizing it!'
						) }
					</p>
				</div>
			);
		}

		if ( isBulkDomainTransfer( purchases ) ) {
			return (
				<>
					<div>
						{ preventWidows(
							_n(
								"We've got it from here. Your domain is being transferred with no downtime.",
								"We've got it from here! Your domains are being transferred with no downtime.",
								purchases?.length
							)
						) }
					</div>
					<div>
						{ preventWidows(
							_n(
								"We'll send an email when your domain is ready to use.",
								"We'll send an email when your domains are ready to use.",
								purchases?.length
							)
						) }
					</div>
				</>
			);
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
					'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan',
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
	visitMyHome = ( event ) => {
		event.preventDefault();

		const { selectedSite } = this.props;

		this.props.recordTracksEvent( 'calypso_thank_you_no_site_receipt_error' );

		page( selectedSite?.slug ? `/home/${ selectedSite.slug }` : '/' );
	};

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

		window.location.href = '/me/quickstart/' + selectedSite.slug + '/book';
	};

	visitTitanWebmail = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_thank_you_titan_webmail_click' );

		window.open( getTitanEmailUrl( this.props.titanAppsUrlPrefix, '' ) );
	};

	startTransfer = ( event ) => {
		event.preventDefault();

		const { primaryPurchase, selectedSite } = this.props;

		this.props.recordStartTransferClickInThankYou( primaryPurchase.meta );

		page( domainManagementTransferInPrecheck( selectedSite.slug, primaryPurchase.meta ) );
	};

	recordThankYouClick = () => {
		this.props.recordTracksEvent( 'calypso_jetpack_product_thankyou', {
			product_name: 'search',
			value: 'Customizer',
			site: 'wpcom',
		} );
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
			return translate( 'Let’s work on the site' );
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

		if ( isTitanMail( primaryPurchase ) ) {
			return (
				<>
					{ translate( 'Log in to my email' ) }
					<Gridicon icon="external" />
				</>
			);
		}

		if ( isGSuiteOrExtraLicenseOrGoogleWorkspace( primaryPurchase ) ) {
			return translate( 'Manage email' );
		}

		return translate( 'Go to My Site' );
	};

	maybeGetSecondaryButton() {
		const { primaryPurchase, selectedSite, translate, upgradeIntent } = this.props;

		if ( upgradeIntent === 'hosting' ) {
			return (
				<Button onClick={ this.visitSiteHostingSettings }>
					{ translate( 'Return to Hosting' ) }
				</Button>
			);
		}

		if ( primaryPurchase && isTitanMail( primaryPurchase ) ) {
			return (
				<Button href={ emailManagementEdit( selectedSite.slug, primaryPurchase.meta ) }>
					{ translate( 'Manage email' ) }
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

	getSearchButtonProps() {
		const { translate, selectedSite, jetpackSearchCustomizeUrl, jetpackSearchDashboardUrl } =
			this.props;

		const buttonTitle = selectedSite.jetpack
			? translate( 'Go to Search Dashboard' )
			: translate( 'Customize Search' );
		const targetUrl = selectedSite.jetpack ? jetpackSearchDashboardUrl : jetpackSearchCustomizeUrl;

		return { title: buttonTitle, url: targetUrl };
	}

	getButtons() {
		const {
			hasFailedPurchases,
			isDataLoaded,
			translate,
			primaryPurchase,
			selectedSite,
			displayMode,
			isAtomic,
		} = this.props;
		const headerButtonClassName = 'button is-primary';
		const isConciergePurchase = 'concierge' === displayMode;

		if ( this.isSearch() ) {
			const buttonProps = this.getSearchButtonProps();
			return (
				<div className="checkout-thank-you__header-button">
					<Button
						className={ headerButtonClassName }
						primary
						href={ buttonProps.url }
						onClick={ this.recordThankYouClick }
					>
						{ buttonProps.title }
					</Button>
				</div>
			);
		}

		if (
			isDataLoaded &&
			( ! primaryPurchase || ! selectedSite || ( selectedSite.jetpack && ! isAtomic ) )
		) {
			return (
				<div className="checkout-thank-you__header-button">
					<Button className={ headerButtonClassName } primary onClick={ this.visitMyHome }>
						{ translate( 'Go to My Home' ) }
					</Button>
				</div>
			);
		}

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

		let clickHandler = this.visitSite;

		if ( isConciergePurchase ) {
			clickHandler = this.visitScheduler;
		} else if ( this.isSingleDomainPurchase() ) {
			clickHandler = this.visitDomain;
		} else if ( isTitanMail( primaryPurchase ) ) {
			clickHandler = this.visitTitanWebmail;
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

	getHeaderText() {
		const { purchases, _n } = this.props;

		if ( isBulkDomainTransfer( purchases ) ) {
			return _n(
				'Your domain transfer has started',
				'Your domain transfers have started',
				purchases?.length
			);
		}

		return getHeading( {
			...this.props,
			isSearch: this.isSearch(),
		} );
	}

	render() {
		const {
			isDataLoaded,
			isSimplified,
			hasFailedPurchases,
			primaryPurchase,
			isRedesignV2,
			selectedSite,
			purchases,
		} = this.props;
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
				{ isBulkDomainTransfer( purchases ) && <UsePresalesChat /> }
				{ ! isRedesignV2 && (
					<div className="checkout-thank-you__header-icon">
						<img src={ `/calypso/images/upgrades/${ svg }` } alt="" />
					</div>
				) }
				<div className="checkout-thank-you__header-content">
					<div className="checkout-thank-you__header-copy">
						<h1 className="checkout-thank-you__header-heading">
							{ preventWidows( this.getHeaderText() ) }
						</h1>
						{ primaryPurchase && isPlan( primaryPurchase ) && isSimplified ? (
							this.renderSimplifiedContent()
						) : (
							<h2 className="checkout-thank-you__header-text">{ this.getText() }</h2>
						) }

						{ isRedesignV2 && (
							<Product
								siteSlug={ selectedSite?.slug }
								primaryPurchase={ primaryPurchase }
								siteID={ selectedSite?.ID }
								purchases={ this.props.purchases }
								currency={ this.props.currency }
							/>
						) }
						{ this.props.children }
						{ ! isRedesignV2 && this.getButtons() }
					</div>
				</div>
			</div>
		);
	}

	renderSimplifiedContent() {
		const { translate, primaryPurchase } = this.props;
		const messages = [
			translate(
				'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan',
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

export function UsePresalesChat() {
	usePresalesChat( 'wpcom' );
}

export default connect(
	( state, ownProps ) => ( {
		isAtomic: isAtomicSite( state, ownProps.selectedSite?.ID ),
		jetpackSearchCustomizeUrl: getJetpackSearchCustomizeUrl( state, ownProps.selectedSite?.ID ),
		jetpackSearchDashboardUrl: getJetpackSearchDashboardUrl( state, ownProps.selectedSite?.ID ),
		titanAppsUrlPrefix: getTitanAppsUrlPrefix(
			getDomainsBySiteId( state, ownProps.selectedSite?.ID ).find( hasTitanMailWithUs )
		),
		upgradeIntent: ownProps.upgradeIntent || getCheckoutUpgradeIntent( state ),
	} ),
	{
		recordStartTransferClickInThankYou,
		recordTracksEvent,
	}
)( localize( withI18n( CheckoutThankYouHeader ) ) );
