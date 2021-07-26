/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import titleCase from 'to-title-case';

/**
 * Internal dependencies
 */
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	transformMailboxForCart,
	validateMailboxes as validateTitanMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import { areAllUsersValid, getItemsForCart, newUsers } from 'calypso/lib/gsuite/new-users';
import { Button } from '@automattic/components';
import {
	canCurrentUserAddEmail,
	getCurrentUserCannotAddEmailReason,
	getSelectedDomain,
} from 'calypso/lib/domains';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import DocumentHead from 'calypso/components/data/document-head';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailProviderCard from './email-provider-card';
import EmailExistingForwardsNotice from 'calypso/my-sites/email/email-existing-forwards-notice';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import {
	getEmailForwardingFeatures,
	getGoogleFeatures,
	getTitanFeatures,
} from 'calypso/my-sites/email/email-provider-features/list';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import { GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY } from 'calypso/lib/gsuite/constants';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import {
	getAnnualPrice,
	getGoogleMailServiceFamily,
	getMonthlyPrice,
	hasGSuiteSupportedDomain,
} from 'calypso/lib/gsuite';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getTitanProductName } from 'calypso/lib/titan';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import { emailManagementForwarding, emailManagement } from 'calypso/my-sites/email/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PromoCard from 'calypso/components/promo-section/promo-card';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import Gridicon from 'calypso/components/gridicon';
import formatCurrency from '@automattic/format-currency';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan.svg';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import forwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-add-mailboxes/titan-new-mailbox-list';
import { withShoppingCart } from '@automattic/shopping-cart';
import HeaderCake from 'calypso/components/header-cake';

/**
 * Style dependencies
 */
import './style.scss';

const identityMap = ( item ) => item;

class EmailProvidersComparison extends React.Component {
	static propTypes = {
		// Props passed to this component
		selectedDomainName: PropTypes.string.isRequired,

		// Props injected via connect()
		currencyCode: PropTypes.string,
		currentRoute: PropTypes.string,
		domain: PropTypes.object,
		gSuiteProduct: PropTypes.object,
		isGSuiteSupported: PropTypes.bool.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		titanMailProduct: PropTypes.object,
	};

	isMounted = false;

	constructor( props ) {
		super( props );

		this.state = {
			googleUsers: [],
			titanMailboxes: [ buildNewTitanMailbox( props.selectedDomainName, false ) ],
			expanded: {
				forwarding: false,
				google: false,
				titan: true,
			},
			addingToCart: false,
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

	goToEmailForwarding = () => {
		const { currentRoute, selectedDomainName, selectedSite } = this.props;

		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'email-forwarding' } );

		page( emailManagementForwarding( selectedSite.slug, selectedDomainName, currentRoute ) );
	};

	isUpgrading = () => {
		const { domain } = this.props;

		return hasEmailForwards( domain );
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
		const { domain } = this.props;
		const { titanMailboxes } = this.state;

		const validatedTitanMailboxes = validateTitanMailboxes( titanMailboxes );

		const mailboxesAreValid = areAllMailboxesValid( validatedTitanMailboxes );
		const userCanAddEmail = canCurrentUserAddEmail( domain );
		const userCannotAddEmailReason = userCanAddEmail
			? null
			: getCurrentUserCannotAddEmailReason( domain );

		recordTracksEvent( 'calypso_email_providers_add_click', {
			mailbox_count: validatedTitanMailboxes.length,
			mailboxes_valid: mailboxesAreValid ? 1 : 0,
			provider: 'titan',
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

		const { productsList, selectedSite, shoppingCartManager } = this.props;

		const cartItem = titanMailMonthly( {
			domain: domain.name,
			quantity: validatedTitanMailboxes.length,
			extra: {
				email_users: validatedTitanMailboxes.map( transformMailboxForCart ),
				new_quantity: validatedTitanMailboxes.length,
			},
		} );

		this.setState( { addingToCart: true } );

		shoppingCartManager
			.addProductsToCart( [ fillInSingleCartItemAttributes( cartItem, productsList ) ] )
			.then( () => {
				if ( this.isMounted ) {
					this.setState( { addingToCart: false } );
				}
				const { errors } = this.props?.cart?.messages;
				if ( errors && errors.length ) {
					// Stay on the page to show the relevant error(s)
					return;
				}
				this.isMounted && page( '/checkout/' + selectedSite.slug );
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

	onGoogleConfirmNewUsers = () => {
		const { domain, gSuiteProduct } = this.props;
		const { googleUsers } = this.state;

		const usersAreValid = areAllUsersValid( googleUsers );
		const userCanAddEmail = canCurrentUserAddEmail( domain );

		recordTracksEvent( 'calypso_email_providers_add_click', {
			mailbox_count: googleUsers.length,
			mailboxes_valid: usersAreValid ? 1 : 0,
			provider: 'google',
			user_can_add_email: userCanAddEmail ? 1 : 0,
		} );

		if ( ! usersAreValid || ! userCanAddEmail ) {
			return;
		}

		const { productsList, selectedSite, shoppingCartManager } = this.props;
		const domains = [ domain ];

		this.setState( { addingToCart: true } );

		shoppingCartManager
			.addProductsToCart(
				getItemsForCart( domains, gSuiteProduct.product_slug, googleUsers ).map( ( item ) =>
					fillInSingleCartItemAttributes( item, productsList )
				)
			)
			.then( () => {
				if ( this.isMounted ) {
					this.setState( { addingToCart: false } );
				}

				const { errors } = this.props?.cart?.messages;

				if ( errors && errors.length ) {
					// Stay on the page to show the relevant error(s)
					return;
				}

				this.isMounted && page( '/checkout/' + selectedSite.slug );
			} );
	};

	renderEmailForwardingCard() {
		const { domain, translate } = this.props;

		if ( this.isUpgrading() ) {
			return null;
		}

		return (
			<EmailProviderCard
				providerKey="forwarding"
				logo={ { path: forwardingIcon } }
				title={ translate( 'Email Forwarding' ) }
				description={ translate(
					'Use your custom domain in your email address and forward all your mail to another address.'
				) }
				detailsExpanded={ this.state.expanded.forwarding }
				onExpandedChange={ this.onExpandedStateChange }
				buttonLabel={ translate( 'Add email forwarding' ) }
				showExpandButton={ this.isDomainEligibleForEmail( domain ) }
				expandButtonLabel={ translate( 'Add email forwarding' ) }
				onButtonClick={ this.goToEmailForwarding }
				features={ getEmailForwardingFeatures() }
			/>
		);
	}

	renderGoogleCard() {
		const {
			currencyCode,
			domain,
			gSuiteProduct,
			isGSuiteSupported,
			selectedDomainName,
			translate,
		} = this.props;

		// TODO: Improve handling of this case
		if ( ! isGSuiteSupported ) {
			return null;
		}

		const formattedPrice = translate( '{{price/}} /user /month billed annually', {
			components: {
				price: <span>{ getMonthlyPrice( gSuiteProduct?.cost ?? null, currencyCode ) }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		} );

		const discount = hasDiscount( gSuiteProduct )
			? translate( 'First year %(discountedPrice)s', {
					args: {
						discountedPrice: getAnnualPrice( gSuiteProduct.sale_cost, currencyCode ),
					},
					comment: '%(discountedPrice)s is a formatted price, e.g. $75',
			  } )
			: null;

		const additionalPriceInformation = translate( '%(price)s billed annually', {
			args: {
				price: getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode ),
			},
			comment: "Annual price formatted with the currency (e.g. '$99.99')",
		} );

		// If we don't have any users, initialize the list to have 1 empty user
		const googleUsers =
			( this.state.googleUsers ?? [] ).length === 0
				? newUsers( selectedDomainName )
				: this.state.googleUsers;

		const buttonLabel = this.isUpgrading()
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

		const formFields = domain ? (
			<FormFieldset>
				<GSuiteNewUserList
					extraValidation={ identityMap }
					domains={ [ domain ] }
					onUsersChange={ this.onGoogleUsersChange }
					selectedDomainName={ selectedDomainName }
					users={ googleUsers }
					onReturnKeyPress={ this.onGoogleFormReturnKeyPress }
					showLabels={ true }
				>
					<Button
						className="email-providers-comparison__gsuite-user-list-action-continue"
						primary
						busy={ this.state.addingToCart }
						onClick={ this.onGoogleConfirmNewUsers }
					>
						{ buttonLabel }
					</Button>
				</GSuiteNewUserList>
			</FormFieldset>
		) : null;

		return (
			<EmailProviderCard
				providerKey="google"
				logo={ { path: googleWorkspaceIcon } }
				title={ getGoogleMailServiceFamily() }
				description={ translate(
					'Professional email integrated with Google Meet and other collaboration tools from Google.'
				) }
				formattedPrice={ formattedPrice }
				discount={ discount }
				additionalPriceInformation={ additionalPriceInformation }
				formFields={ formFields }
				detailsExpanded={ this.state.expanded.google }
				onExpandedChange={ this.onExpandedStateChange }
				onButtonClick={ this.onGoogleConfirmNewUsers }
				showExpandButton={ this.isDomainEligibleForEmail( domain ) }
				expandButtonLabel={ buttonLabel }
				features={ getGoogleFeatures() }
			/>
		);
	}

	renderTitanCard() {
		const { currencyCode, domain, selectedDomainName, titanMailProduct, translate } = this.props;

		const formattedPrice = translate( '{{price/}} /user /month billed monthly', {
			components: {
				price: <span>{ formatCurrency( titanMailProduct?.cost ?? 0, currencyCode ) }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		} );

		const isEligibleForFreeTrial = domain?.titanMailSubscription?.isEligibleForIntroductoryOffer;
		const discount = isEligibleForFreeTrial ? translate( '3 months free' ) : null;

		const logo = (
			<Gridicon
				className="email-providers-comparison__providers-wordpress-com-email"
				icon="my-sites"
			/>
		);

		const poweredByTitan = (
			<img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />
		);

		const buttonLabel = this.isUpgrading()
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
				domain={ selectedDomainName }
				onReturnKeyPress={ this.onTitanFormReturnKeyPress }
				showLabels={ true }
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
			</TitanNewMailboxList>
		);

		return (
			<EmailProviderCard
				providerKey="titan"
				logo={ logo }
				title={ getTitanProductName() }
				badge={ poweredByTitan }
				description={ translate(
					'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
				) }
				detailsExpanded={ this.state.expanded.titan }
				onExpandedChange={ this.onExpandedStateChange }
				formattedPrice={ formattedPrice }
				discount={ discount }
				formFields={ formFields }
				showExpandButton={ this.isDomainEligibleForEmail( domain ) }
				expandButtonLabel={ buttonLabel }
				features={ getTitanFeatures() }
			/>
		);
	}

	handleBack = () => {
		const { backPath, selectedSite } = this.props;

		page( backPath ?? emailManagement( selectedSite.slug ) );
	};

	renderHeader() {
		const {
			currentRoute,
			selectedDomainName,
			selectedSite,
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

		const title = this.isUpgrading()
			? translate( 'Upgrade to a hosted email' )
			: translate( 'Add email' );

		const headerContent = skipHeaderElement ? null : (
			<HeaderCake onClick={ this.handleBack }>{ title }</HeaderCake>
		);

		return (
			<>
				<DocumentHead title={ titleCase( title ) } />

				<EmailHeader currentRoute={ currentRoute } selectedSite={ selectedSite } />

				{ headerContent }

				<PromoCard
					isPrimary
					title={
						this.isUpgrading()
							? translate( 'Upgrade to start sending emails from %(domainName)s', translateArgs )
							: translate( 'Get your own @%(domainName)s email address', translateArgs )
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

	isDomainEligibleForEmail( domain ) {
		const canUserAddEmail = canCurrentUserAddEmail( domain );
		if ( canUserAddEmail ) {
			return true;
		}

		const cannotAddEmailReason = getCurrentUserCannotAddEmailReason( domain );
		return ! cannotAddEmailReason || ! cannotAddEmailReason.message;
	}

	renderDomainEligibilityNotice() {
		const { domain } = this.props;

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
						domain: domain.name,
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
		const { domainsWithForwards, isGSuiteSupported, selectedDomainName, selectedSite } = this.props;

		return (
			<Main wideLayout>
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				<QueryEmailForwards domainName={ selectedDomainName } />

				{ this.renderHeader() }

				{ this.renderDomainEligibilityNotice() }

				<EmailExistingForwardsNotice
					domainsWithForwards={ domainsWithForwards }
					selectedDomainName={ selectedDomainName }
				/>

				{ this.renderTitanCard() }

				{ this.renderGoogleCard() }

				{ this.renderEmailForwardingCard() }

				<TrackComponentView
					eventName="calypso_email_providers_comparison_page_view"
					eventProperties={ {
						is_gsuite_supported: isGSuiteSupported,
						layout: 'stacked',
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

		const isGSuiteSupported = domain
			? canUserPurchaseGSuite( state ) && hasGSuiteSupportedDomain( [ domain ] )
			: true;

		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			currentRoute: getCurrentRoute( state ),
			domain,
			domainsWithForwards: getDomainsWithForwards( state, domains ),
			gSuiteProduct: getProductBySlug( state, GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY ),
			isGSuiteSupported,
			productsList: getProductsList( state ),
			selectedSite,
			titanMailProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
		};
	}
)( withShoppingCart( localize( EmailProvidersComparison ) ) );
