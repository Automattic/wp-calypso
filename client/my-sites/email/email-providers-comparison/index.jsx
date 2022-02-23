import { Button, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { withShoppingCart } from '@automattic/shopping-cart';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titleCase from 'to-title-case';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import forwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan.svg';
import DocumentHead from 'calypso/components/data/document-head';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import HeaderCake from 'calypso/components/header-cake';
import InfoPopover from 'calypso/components/info-popover';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PromoCard from 'calypso/components/promo-section/promo-card';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { titanMailMonthly, titanMailYearly } from 'calypso/lib/cart-values/cart-items';
import {
	canCurrentUserAddEmail,
	getCurrentUserCannotAddEmailReason,
	getSelectedDomain,
} from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import {
	getAnnualPrice,
	getGoogleMailServiceFamily,
	getMonthlyPrice,
	hasGSuiteSupportedDomain,
} from 'calypso/lib/gsuite';
import {
	GOOGLE_PROVIDER_NAME,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from 'calypso/lib/gsuite/constants';
import {
	areAllUsersValid,
	getItemsForCart,
	newUsers,
	validateUsers,
} from 'calypso/lib/gsuite/new-users';
import {
	getTitanProductName,
	isDomainEligibleForTitanFreeTrial,
	isTitanMonthlyProduct,
} from 'calypso/lib/titan';
import { TITAN_MAIL_MONTHLY_SLUG, TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	transformMailboxForCart,
	validateMailboxes as validateTitanMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import EmailExistingForwardsNotice from 'calypso/my-sites/email/email-existing-forwards-notice';
import EmailForwardingAddNewCompactList from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact-list';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	getEmailForwardingFeatures,
	getGoogleAppLogos,
	getGoogleFeatures,
	getTitanFeatures,
} from 'calypso/my-sites/email/email-provider-features/list';
import { emailManagement } from 'calypso/my-sites/email/paths';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-new-mailbox-list';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	getProductBySlug,
	getProductIntroductoryOffer,
} from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import {
	getDomainsWithForwards,
	isAddingEmailForward,
} from 'calypso/state/selectors/get-email-forwards';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import EmailProviderCard from './email-provider-card';

import './style.scss';

const identityMap = ( item ) => item;

class EmailProvidersComparison extends Component {
	static propTypes = {
		// Props passed to this component
		cartDomainName: PropTypes.string,
		comparisonContext: PropTypes.string,
		headerTitle: PropTypes.string,
		hideEmailForwardingCard: PropTypes.bool,
		hideEmailHeader: PropTypes.bool,
		onSkipClick: PropTypes.func,
		promoHeaderTitle: PropTypes.string,
		selectedDomainName: PropTypes.string.isRequired,
		showSkipButton: PropTypes.bool,
		skipButtonLabel: PropTypes.string,
		source: PropTypes.string,
		titanProductSlug: PropTypes.string,

		// Props injected via connect()
		currencyCode: PropTypes.string,
		domain: PropTypes.object,
		domainName: PropTypes.string,
		gSuiteIntroductoryOffer: PropTypes.object,
		gSuiteProduct: PropTypes.object,
		hasCartDomain: PropTypes.bool,
		isGSuiteSupported: PropTypes.bool.isRequired,
		isSubmittingEmailForward: PropTypes.bool,
		selectedSite: PropTypes.object,
		titanMailProduct: PropTypes.object,
	};

	static defaultProps = {
		comparisonContext: 'email-purchase',
	};

	isMounted = false;

	constructor( props ) {
		super( props );

		const { selectedDomainName } = props;

		this.state = {
			googleUsers: newUsers( selectedDomainName ),
			titanMailboxes: [ buildNewTitanMailbox( selectedDomainName, false ) ],
			expanded: {
				forwarding: false,
				google: false,
				titan: true,
			},
			addingToCart: false,
			emailForwardAdded: false,
			validatedTitanMailboxUuids: [],
		};
	}

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	onExpandedStateChange = ( providerKey, isExpanded ) => {
		const expandedEntries = Object.entries( this.state.expanded ).map( ( entry ) => {
			const [ key, currentExpanded ] = entry;
			if ( isExpanded ) {
				return [ key, key === providerKey ];
			}
			return [ key, key === providerKey ? isExpanded : currentExpanded ];
		} );

		if ( isExpanded ) {
			recordTracksEvent( 'calypso_email_providers_expand_section_click', {
				provider: providerKey,
			} );
		}

		this.setState( { expanded: Object.fromEntries( expandedEntries ) } );
	};

	isUpgrading = () => {
		const { domain, hasCartDomain } = this.props;

		return ! hasCartDomain && hasEmailForwards( domain );
	};

	onTitanMailboxesChange = ( updatedMailboxes ) =>
		this.setState( { titanMailboxes: updatedMailboxes } );

	onTitanFormReturnKeyPress = ( event ) => {
		// Simulate form submission
		if ( event.key === 'Enter' ) {
			this.onTitanConfirmNewMailboxes();
		}
	};

	onTitanConfirmNewMailboxes = () => {
		const {
			comparisonContext,
			domain,
			domainName,
			hasCartDomain,
			source,
			titanMailProduct,
		} = this.props;
		const { titanMailboxes } = this.state;

		const validatedTitanMailboxes = validateTitanMailboxes( titanMailboxes );

		const mailboxesAreValid = areAllMailboxesValid( validatedTitanMailboxes );
		const userCanAddEmail = hasCartDomain || canCurrentUserAddEmail( domain );
		const userCannotAddEmailReason = userCanAddEmail
			? null
			: getCurrentUserCannotAddEmailReason( domain );

		recordTracksEvent( 'calypso_email_providers_add_click', {
			context: comparisonContext,
			mailbox_count: validatedTitanMailboxes.length,
			mailboxes_valid: mailboxesAreValid ? 1 : 0,
			provider: TITAN_PROVIDER_NAME,
			source,
			user_can_add_email: userCanAddEmail,
			user_cannot_add_email_code: userCannotAddEmailReason ? userCannotAddEmailReason.code : '',
		} );

		const validatedTitanMailboxUuids = validatedTitanMailboxes.map( ( mailbox ) => mailbox.uuid );

		this.setState( {
			titanMailboxes: validatedTitanMailboxes,
			validatedTitanMailboxUuids,
		} );

		if ( ! mailboxesAreValid || ! userCanAddEmail ) {
			return;
		}

		const { selectedSite, shoppingCartManager } = this.props;

		const cartItemArgs = {
			domain: domainName,
			quantity: validatedTitanMailboxes.length,
			extra: {
				email_users: validatedTitanMailboxes.map( transformMailboxForCart ),
				new_quantity: validatedTitanMailboxes.length,
			},
		};

		const cartItem = isTitanMonthlyProduct( titanMailProduct )
			? titanMailMonthly( cartItemArgs )
			: titanMailYearly( cartItemArgs );

		this.setState( { addingToCart: true } );

		shoppingCartManager.addProductsToCart( [ cartItem ] ).then( () => {
			if ( this.isMounted ) {
				this.setState( { addingToCart: false } );
				page( '/checkout/' + selectedSite.slug );
			}
		} );
	};

	onGoogleUsersChange = ( changedUsers ) => {
		this.setState( { googleUsers: changedUsers } );
	};

	onGoogleFormReturnKeyPress = ( event ) => {
		// Simulate form submission
		if ( event.key === 'Enter' ) {
			this.onGoogleConfirmNewUsers();
		}
	};

	onForwardingConfirmNewMailboxes = () => {
		const { comparisonContext, source } = this.props;

		recordTracksEvent( 'calypso_email_providers_add_click', {
			context: comparisonContext,
			provider: 'email-forwarding',
			source,
		} );
	};

	onGoogleConfirmNewUsers = () => {
		const { comparisonContext, domain, gSuiteProduct, hasCartDomain, source } = this.props;
		const { googleUsers } = this.state;
		const validatedUsers = validateUsers( googleUsers );

		const usersAreValid = areAllUsersValid( validatedUsers );
		const userCanAddEmail = hasCartDomain || canCurrentUserAddEmail( domain );

		this.setState( {
			validatedMailboxUuids: validatedUsers.map( ( user ) => user.uuid ),
			googleUsers: validatedUsers,
		} );

		recordTracksEvent( 'calypso_email_providers_add_click', {
			context: comparisonContext,
			mailbox_count: googleUsers.length,
			mailboxes_valid: usersAreValid ? 1 : 0,
			provider: GOOGLE_PROVIDER_NAME,
			source,
			user_can_add_email: userCanAddEmail ? 1 : 0,
		} );

		if ( ! usersAreValid || ! userCanAddEmail ) {
			return;
		}

		const { selectedSite, shoppingCartManager } = this.props;
		const domains = domain ? [ domain ] : [];

		this.setState( { addingToCart: true } );

		shoppingCartManager
			.addProductsToCart( getItemsForCart( domains, gSuiteProduct.product_slug, googleUsers ) )
			.then( () => {
				if ( this.isMounted ) {
					this.setState( { addingToCart: false } );
					page( '/checkout/' + selectedSite.slug );
				}
			} );
	};

	onAddEmailForwardSuccess = () => {
		this.setState( { emailForwardAdded: true } );
		const { domain, getSiteDomains, requestingSiteDomains, selectedSite } = this.props;
		if ( ! requestingSiteDomains ) {
			getSiteDomains( selectedSite.ID );
		}
		page( emailManagement( selectedSite.slug, domain.name ) );
	};

	renderEmailForwardingCard() {
		const { domain, selectedDomainName, translate } = this.props;

		if ( this.isUpgrading() ) {
			return null;
		}

		const formFields = (
			<EmailForwardingAddNewCompactList
				selectedDomainName={ selectedDomainName }
				onConfirmEmailForwarding={ this.onForwardingConfirmNewMailboxes }
				onAddEmailForwardSuccess={ this.onAddEmailForwardSuccess }
			/>
		);

		return (
			<EmailProviderCard
				providerKey="forwarding"
				logo={ { path: forwardingIcon } }
				title={ translate( 'Email Forwarding' ) }
				description={ translate(
					'Use your custom domain in your email address and forward all your mail to another address.'
				) }
				detailsExpanded={ this.state.expanded.forwarding }
				formFields={ formFields }
				onExpandedChange={ this.onExpandedStateChange }
				showExpandButton={ this.isDomainEligibleForEmail( domain ) }
				expandButtonLabel={ translate( 'Add email forwarding' ) }
				features={ getEmailForwardingFeatures() }
			/>
		);
	}

	getAvailableDiscountForGoogle( {
		currencyCode,
		isEligibleForFreeTrial,
		gSuiteProduct,
		productIsDiscounted,
		standardPrice,
	} ) {
		const { translate } = this.props;

		if ( productIsDiscounted ) {
			return (
				<span className="email-providers-comparison__discount-with-renewal">
					{ translate(
						'%(discount)d%% off{{span}}, %(discountedPrice)s billed today, renews at %(standardPrice)s{{/span}}',
						{
							args: {
								discount: gSuiteProduct.sale_coupon.discount,
								discountedPrice: getAnnualPrice( gSuiteProduct.sale_cost, currencyCode ),
								standardPrice,
							},
							comment:
								"%(discount)d is a numeric percentage discount (e.g. '50'), " +
								"%(discountedPrice)s is a formatted, discounted price that the user will pay today (e.g. '$3'), " +
								"%(standardPrice)s is a formatted price (e.g. '$5')",
							components: {
								span: <span className={ 'email-providers-comparison__google-discount' } />,
							},
						}
					) }

					<InfoPopover position="right" showOnHover>
						{ translate(
							'This discount is only available the first time you purchase a %(googleMailService)s account, any additional mailboxes purchased after that will be at the regular price.',
							{
								args: {
									googleMailService: getGoogleMailServiceFamily(),
								},
								comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
							}
						) }
					</InfoPopover>
				</span>
			);
		}

		if ( isEligibleForFreeTrial ) {
			return (
				<>
					{ translate( '1 month free' ) }
					<span className="email-providers-comparison__discount-with-renewal">
						<span>
							{ translate(
								'%(firstRenewalPrice)s/mailbox billed in 1 month, renews at %(standardPrice)s/mailbox',
								{
									args: {
										firstRenewalPrice: formatCurrency(
											( ( gSuiteProduct?.cost ?? 0 ) * 11 ) / 12,
											currencyCode
										),
										standardPrice,
									},
									comment:
										"%(firstRenewalPrice)s is a formatted, reduced price that the user will pay in one month (e.g. '$3'), " +
										"%(standardPrice)s is a formatted price (e.g. '$5')",
								}
							) }
						</span>
					</span>
				</>
			);
		}

		return null;
	}

	renderGoogleCard() {
		const {
			currencyCode,
			domain,
			gSuiteIntroductoryOffer,
			gSuiteProduct,
			hasCartDomain,
			isGSuiteSupported,
			onSkipClick,
			selectedDomainName,
			showSkipButton,
			skipButtonLabel,
			translate,
		} = this.props;

		const { validatedMailboxUuids } = this.state;

		// TODO: Improve handling of this case
		if ( ! isGSuiteSupported ) {
			return null;
		}

		const isEligibleForFreeTrial = gSuiteIntroductoryOffer && hasCartDomain;

		const productIsDiscounted = hasDiscount( gSuiteProduct );
		const monthlyPrice = getMonthlyPrice( gSuiteProduct?.cost ?? null, currencyCode );
		const formattedPrice = productIsDiscounted
			? translate( '{{fullPrice/}} {{discountedPrice/}} /mailbox /month (billed annually)', {
					components: {
						fullPrice: <span>{ monthlyPrice }</span>,
						discountedPrice: (
							<span className="email-providers-comparison__discounted-price">
								{ getMonthlyPrice( gSuiteProduct.sale_cost, currencyCode ) }
							</span>
						),
					},
					comment:
						'{{fullPrice/}} is the formatted full price, e.g. $20; {{discountedPrice/}} is the discounted, formatted price, e.g. $10',
			  } )
			: translate( '{{price/}} /mailbox /month (billed annually)', {
					components: {
						price: <span>{ monthlyPrice }</span>,
					},
					comment: '{{price/}} is the formatted price, e.g. $20',
			  } );

		const standardPrice =
			! productIsDiscounted && isEligibleForFreeTrial
				? formatCurrency( gSuiteProduct?.cost ?? null, currencyCode )
				: getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode );

		const discount = this.getAvailableDiscountForGoogle( {
			currencyCode,
			isEligibleForFreeTrial,
			gSuiteProduct,
			productIsDiscounted,
			standardPrice,
		} );

		const starLabel = productIsDiscounted
			? translate( '%(discount)d%% off!', {
					args: {
						discount: gSuiteProduct.sale_coupon.discount,
					},
					comment: "%(discount)d is a numeric discount percentage (e.g. '40')",
			  } )
			: null;

		// If we don't have any users, initialize the list to have 1 empty user
		const googleUsers =
			( this.state.googleUsers ?? [] ).length === 0
				? newUsers( selectedDomainName )
				: this.state.googleUsers;

		const buttonLabel = this.isUpgrading() ? translate( 'Upgrade' ) : translate( 'Add' );

		const expandButtonLabel = this.isUpgrading()
			? translate( 'Upgrade to %(googleMailService)s', {
					args: {
						googleMailService: getGoogleMailServiceFamily(),
					},
					comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
			  } )
			: translate( 'Add %(googleMailService)s', {
					args: {
						googleMailService: getGoogleMailServiceFamily(),
					},
					comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
			  } );

		const domainList = domain ? [ domain ] : null;

		const formFields =
			hasCartDomain || domain ? (
				<FormFieldset>
					<GSuiteNewUserList
						extraValidation={ identityMap }
						domains={ domainList }
						onUsersChange={ this.onGoogleUsersChange }
						selectedDomainName={ selectedDomainName }
						users={ googleUsers }
						onReturnKeyPress={ this.onGoogleFormReturnKeyPress }
						validatedMailboxUuids={ validatedMailboxUuids }
					>
						<div className="email-providers-comparison__gsuite-user-list-actions-container">
							<Button
								primary
								busy={ this.state.addingToCart }
								onClick={ this.onGoogleConfirmNewUsers }
							>
								{ buttonLabel }
							</Button>

							{ showSkipButton && (
								<Button busy={ this.state.addingToCart } onClick={ onSkipClick }>
									{ skipButtonLabel }
								</Button>
							) }
						</div>
					</GSuiteNewUserList>
				</FormFieldset>
			) : null;

		return (
			<EmailProviderCard
				providerKey="google"
				logo={ { path: googleWorkspaceIcon } }
				title={ getGoogleMailServiceFamily() }
				starLabel={ starLabel }
				description={ translate(
					'Business email with Gmail. Includes other collaboration and productivity tools from Google.'
				) }
				formattedPrice={ formattedPrice }
				discount={ discount }
				formFields={ formFields }
				detailsExpanded={ this.state.expanded.google }
				onExpandedChange={ this.onExpandedStateChange }
				onButtonClick={ this.onGoogleConfirmNewUsers }
				showExpandButton={ this.isDomainEligibleForEmail( domain ) }
				expandButtonLabel={ expandButtonLabel }
				features={ getGoogleFeatures() }
				appLogos={ getGoogleAppLogos() }
			/>
		);
	}

	renderTitanCard() {
		const {
			currencyCode,
			domain,
			hasCartDomain,
			onSkipClick,
			selectedDomainName,
			showSkipButton,
			skipButtonLabel,
			titanMailProduct,
			translate,
		} = this.props;

		const isEligibleForFreeTrial = hasCartDomain || isDomainEligibleForTitanFreeTrial( domain );

		const formattedPriceClassName = classNames( {
			'email-providers-comparison__keep-main-price': ! isEligibleForFreeTrial,
		} );

		const titanIsMonthly = titanMailProduct && isTitanMonthlyProduct( titanMailProduct );

		const titanMonthlyCost = titanIsMonthly
			? titanMailProduct?.cost ?? 0
			: ( titanMailProduct?.cost ?? 0 ) / 12;

		const monthlyPrice = formatCurrency( titanMonthlyCost, currencyCode );

		const priceComponents = {
			components: {
				price: <span className={ formattedPriceClassName }>{ monthlyPrice }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		};

		const formattedPrice = titanIsMonthly
			? translate( '{{price/}} /mailbox /month (billed monthly)', priceComponents )
			: translate( '{{price/}} /mailbox /month (billed annually)', priceComponents );

		const discount = ! isEligibleForFreeTrial ? null : (
			<>
				{ translate( '3 months free' ) }
				{ ! titanIsMonthly && (
					<span className="email-providers-comparison__discount-with-renewal">
						<span>
							{ translate(
								'%(firstRenewalPrice)s/mailbox billed in 3 months, renews at %(standardPrice)s/mailbox',
								{
									args: {
										firstRenewalPrice: formatCurrency(
											( titanMailProduct?.cost ?? 0 ) * 0.75,
											currencyCode
										),
										standardPrice: formatCurrency( titanMailProduct?.cost ?? 0, currencyCode ),
									},
									comment:
										"%(firstRenewalPrice)s is a formatted, reduced price that the user will pay in three months (e.g. '$3'), " +
										"%(standardPrice)s is a formatted price (e.g. '$5')",
								}
							) }
						</span>
					</span>
				) }
			</>
		);

		const logo = (
			<Gridicon
				className="email-providers-comparison__providers-wordpress-com-email"
				icon="my-sites"
			/>
		);

		const poweredByTitan = (
			<img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />
		);

		const buttonLabel = this.isUpgrading() ? translate( 'Upgrade' ) : translate( 'Add' );

		const expandButtonLabel = this.isUpgrading()
			? translate( 'Upgrade to %(titanProductName)s', {
					args: {
						titanProductName: getTitanProductName(),
					},
					comment:
						'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
			  } )
			: translate( 'Add %(titanProductName)s', {
					args: {
						titanProductName: getTitanProductName(),
					},
					comment:
						'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
			  } );

		const formFields = (
			<TitanNewMailboxList
				onMailboxesChange={ this.onTitanMailboxesChange }
				mailboxes={ this.state.titanMailboxes }
				selectedDomainName={ selectedDomainName }
				onReturnKeyPress={ this.onTitanFormReturnKeyPress }
				validatedMailboxUuids={ this.state.validatedTitanMailboxUuids }
			>
				<Button
					className="email-providers-comparison__titan-mailbox-action-continue"
					primary
					busy={ this.state.addingToCart }
					onClick={ this.onTitanConfirmNewMailboxes }
				>
					{ buttonLabel }
				</Button>

				{ showSkipButton && (
					<Button
						className="email-providers-comparison__titan-mailbox-action-skip"
						busy={ this.state.addingToCart }
						onClick={ onSkipClick }
					>
						{ skipButtonLabel }
					</Button>
				) }
			</TitanNewMailboxList>
		);

		return (
			<EmailProviderCard
				providerKey="titan"
				logo={ logo }
				title={ getTitanProductName() }
				badge={ poweredByTitan }
				description={ translate(
					'Integrated email solution with powerful features. Manage your email and more on any device.'
				) }
				detailsExpanded={ this.state.expanded.titan }
				onExpandedChange={ this.onExpandedStateChange }
				formattedPrice={ formattedPrice }
				discount={ discount }
				formFields={ formFields }
				showExpandButton={ this.isDomainEligibleForEmail( domain ) }
				expandButtonLabel={ expandButtonLabel }
				features={ getTitanFeatures( titanIsMonthly ) }
			/>
		);
	}

	handleBack = () => {
		const { backPath, selectedSite } = this.props;

		page( backPath ?? emailManagement( selectedSite.slug ) );
	};

	renderHeader() {
		const {
			headerTitle,
			hideEmailHeader,
			promoHeaderTitle,
			selectedDomainName,
			skipHeaderElement,
			translate,
		} = this.props;

		const image = {
			path: emailIllustration,
			align: 'right',
		};

		const translateArgs = {
			args: {
				domainName: selectedDomainName,
			},
			comment: '%(domainName)s is the domain name, e.g example.com',
		};

		const title =
			headerTitle ??
			( this.isUpgrading() ? translate( 'Upgrade to a hosted email' ) : translate( 'Add email' ) );

		const headerContent = skipHeaderElement ? null : (
			<HeaderCake
				actionButton={ this.renderHeaderSkipButton() }
				alwaysShowActionText
				onClick={ this.handleBack }
			>
				{ title }
			</HeaderCake>
		);

		return (
			<>
				<DocumentHead title={ titleCase( title ) } />

				{ ! hideEmailHeader && <EmailHeader /> }

				{ headerContent }

				<PromoCard
					isPrimary
					title={
						promoHeaderTitle ??
						( this.isUpgrading()
							? translate( 'Upgrade to start sending emails from %(domainName)s', translateArgs )
							: translate( 'Get your own @%(domainName)s email address', translateArgs ) )
					}
					image={ image }
					className="email-providers-comparison__action-panel"
				>
					<p>
						{ this.isUpgrading()
							? translate( 'Pick from one of our flexible options to unlock full email features.' )
							: translate(
									'Pick one of our flexible options to connect your domain with email ' +
										'and start getting emails @%(domainName)s today.',
									translateArgs
							  ) }
					</p>
				</PromoCard>
			</>
		);
	}

	renderHeaderSkipButton() {
		const { showSkipButton, onSkipClick, skipButtonLabel } = this.props;

		return showSkipButton ? (
			<Button compact borderless onClick={ onSkipClick }>
				{ skipButtonLabel }
				<Gridicon icon={ 'arrow-right' } size={ 18 } />
			</Button>
		) : null;
	}

	isDomainEligibleForEmail( domain ) {
		const { hasCartDomain } = this.props;

		if ( hasCartDomain ) {
			return true;
		}

		const canUserAddEmail = canCurrentUserAddEmail( domain );
		if ( canUserAddEmail ) {
			return true;
		}

		const cannotAddEmailReason = getCurrentUserCannotAddEmailReason( domain );
		return ! cannotAddEmailReason || ! cannotAddEmailReason.message;
	}

	renderDomainEligibilityNotice() {
		const { comparisonContext, domain, domainName } = this.props;

		if ( this.isDomainEligibleForEmail( domain ) ) {
			return null;
		}

		const cannotAddEmailReason = getCurrentUserCannotAddEmailReason( domain );
		if ( ! cannotAddEmailReason || ! cannotAddEmailReason.message ) {
			return null;
		}

		return (
			<>
				<TrackComponentView
					eventName="calypso_email_providers_comparison_page_domain_not_eligible_error_impression"
					eventProperties={ {
						context: comparisonContext,
						domain: domainName,
						error_code: cannotAddEmailReason.code,
					} }
				/>
				<Notice showDismiss={ false } status="is-error">
					{ cannotAddEmailReason.message }
				</Notice>
			</>
		);
	}

	render() {
		const {
			comparisonContext,
			domainsWithForwards,
			hideEmailForwardingCard,
			isGSuiteSupported,
			isSubmittingEmailForward,
			selectedDomainName,
			selectedSite,
			source,
		} = this.props;

		// Ensure we hide the warning when any of the conditions are true:
		// - We're not showing the email forward card
		// - We're currently submitting/creating an email forward
		// - We have added an email forward from this component
		const shouldShowEmailForwardWarning =
			! hideEmailForwardingCard && ! isSubmittingEmailForward && ! this.state.emailForwardAdded;

		return (
			<Main wideLayout>
				<QueryProductsList />

				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				{ ! hideEmailForwardingCard && <QueryEmailForwards domainName={ selectedDomainName } /> }

				{ this.renderHeader() }

				{ this.renderDomainEligibilityNotice() }

				{ shouldShowEmailForwardWarning && (
					<EmailExistingForwardsNotice
						domainsWithForwards={ domainsWithForwards }
						selectedDomainName={ selectedDomainName }
					/>
				) }

				{ this.renderTitanCard() }

				{ this.renderGoogleCard() }

				{ ! hideEmailForwardingCard && this.renderEmailForwardingCard() }

				<TrackComponentView
					eventName="calypso_email_providers_comparison_page_view"
					eventProperties={ {
						context: comparisonContext,
						is_gsuite_supported: isGSuiteSupported,
						layout: 'stacked',
						source,
					} }
				/>
			</Main>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const selectedSite = getSelectedSite( state );
		const domains = getDomainsBySiteId( state, selectedSite.ID );
		const domain = getSelectedDomain( {
			domains,
			selectedDomainName: ownProps.selectedDomainName,
		} );

		const resolvedDomainName = domain ? domain.name : ownProps.selectedDomainName;
		const domainName = ownProps.cartDomainName ?? resolvedDomainName;
		const hasCartDomain = Boolean( ownProps.cartDomainName );

		const isGSuiteSupported =
			canUserPurchaseGSuite( state ) &&
			( hasCartDomain || ( domain && hasGSuiteSupportedDomain( [ domain ] ) ) );
		const gSuiteProduct = getProductBySlug( state, GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY );

		const titanProductSlug = ownProps.titanProductSlug ?? TITAN_MAIL_MONTHLY_SLUG;

		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			domain,
			domainName,
			domainsWithForwards: getDomainsWithForwards( state, domains ),
			gSuiteIntroductoryOffer: getProductIntroductoryOffer(
				state,
				GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
			),
			gSuiteProduct,
			hasCartDomain,
			isSubmittingEmailForward: isAddingEmailForward( state, ownProps.selectedDomainName ),
			isGSuiteSupported,
			requestingSiteDomains: isRequestingSiteDomains( state, domainName ),
			selectedSite,
			titanMailProduct: getProductBySlug( state, titanProductSlug ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
			getSiteDomains: ( siteId ) => dispatch( fetchSiteDomains( siteId ) ),
		};
	}
)( withCartKey( withShoppingCart( localize( EmailProvidersComparison ) ) ) );
