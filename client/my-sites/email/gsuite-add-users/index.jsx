import { isGoogleWorkspaceMonthly } from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { withShoppingCart } from '@automattic/shopping-cart';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryGSuiteUsers from 'calypso/components/data/query-gsuite-users';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getEligibleGSuiteDomain,
	getGoogleMailServiceFamily,
	getGSuiteExpiryDate,
	getGSuiteMailboxPurchaseCost,
	getGSuiteMailboxRenewalCost,
	getGSuiteProductSlug,
	getGSuiteSupportedDomains,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import {
	GOOGLE_PROVIDER_NAME,
	GOOGLE_WORKSPACE_PRODUCT_TYPE,
	GSUITE_PRODUCT_TYPE,
} from 'calypso/lib/gsuite/constants';
import {
	areAllUsersValid,
	getItemsForCart,
	newUsers,
	validateAgainstExistingUsers,
	validateUsers,
} from 'calypso/lib/gsuite/new-users';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailPricingNotice from 'calypso/my-sites/email/email-pricing-notice';
import { emailManagementAddGSuiteUsers, emailManagement } from 'calypso/my-sites/email/paths';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getGSuiteUsers from 'calypso/state/selectors/get-gsuite-users';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import AddEmailAddressesCardPlaceholder from './add-users-placeholder';

import './style.scss';

class GSuiteAddUsers extends Component {
	state = {
		users: [],
		validatedMailboxUuids: [],
	};

	isMounted = false;

	static getDerivedStateFromProps(
		{ domains, isRequestingDomains, selectedDomainName, userCanPurchaseGSuite },
		{ users }
	) {
		if ( ! isRequestingDomains && 0 === users.length && userCanPurchaseGSuite ) {
			const domainName = getEligibleGSuiteDomain( selectedDomainName, domains );

			if ( '' !== domainName ) {
				const newUser = newUsers( domainName );
				return {
					users: newUser,
				};
			}
		}

		return null;
	}

	handleContinue = () => {
		const { domains, googleMailProduct, selectedSite } = this.props;
		const { users } = this.state;
		const validatedUsers = validateUsers( users );
		const canContinue = areAllUsersValid( validatedUsers );

		this.setState( {
			validatedMailboxUuids: validatedUsers.map( ( user ) => user.uuid ),
			users: validatedUsers,
		} );

		this.recordClickEvent( 'calypso_email_management_gsuite_add_users_continue_button_click' );

		if ( canContinue ) {
			this.props.shoppingCartManager
				.addProductsToCart( getItemsForCart( domains, googleMailProduct.product_slug, users ) )
				.then( () => {
					this.isMounted && page( '/checkout/' + selectedSite.slug );
				} );
		}
	};

	handleCancel = () => {
		this.recordClickEvent( 'calypso_email_management_gsuite_add_users_cancel_button_click' );
		this.goToEmail();
	};

	handleReturnKeyPress = ( event ) => {
		// Simulate an implicit submission for the add user form :)
		if ( event.key === 'Enter' ) {
			this.handleContinue();
		}
	};

	handleUsersChange = ( changedUsers ) => {
		const { users: previousUsers } = this.state;

		this.recordUsersChangedEvent( previousUsers, changedUsers );

		this.setState( {
			users: changedUsers,
		} );
	};

	recordClickEvent = ( eventName ) => {
		const { recordTracksEvent, selectedDomainName, source } = this.props;
		const { users } = this.state;

		recordTracksEvent( eventName, {
			domain_name: selectedDomainName,
			provider: GOOGLE_PROVIDER_NAME,
			source,
			user_count: users.length,
		} );
	};

	recordUsersChangedEvent = ( previousUsers, nextUsers ) => {
		const { recordTracksEvent, selectedDomainName } = this.props;

		if ( previousUsers.length !== nextUsers.length ) {
			recordTracksEvent( 'calypso_email_management_gsuite_add_users_users_changed', {
				domain_name: selectedDomainName,
				next_user_count: nextUsers.length,
				prev_user_count: previousUsers.length,
			} );
		}
	};

	componentDidMount() {
		const { domains, isRequestingDomains, selectedDomainName } = this.props;

		this.redirectIfCannotAddEmail( domains, isRequestingDomains, selectedDomainName );
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	shouldComponentUpdate( nextProps ) {
		const { domains, isRequestingDomains, selectedDomainName } = nextProps;

		this.redirectIfCannotAddEmail( domains, isRequestingDomains, selectedDomainName );

		if ( isRequestingDomains || ! domains.length ) {
			return false;
		}

		return true;
	}

	redirectIfCannotAddEmail( domains, isRequestingDomains, selectedDomainName ) {
		if ( isRequestingDomains || '' !== getEligibleGSuiteDomain( selectedDomainName, domains ) ) {
			return;
		}
		this.goToEmail();
	}

	goToEmail = () => {
		page(
			emailManagement(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
	};

	renderAddGSuite() {
		const {
			domains,
			gsuiteUsers,
			isRequestingDomains,
			selectedDomainName,
			translate,
			userCanPurchaseGSuite,
		} = this.props;

		const { users, validatedMailboxUuids } = this.state;

		const selectedDomainInfo = getGSuiteSupportedDomains( domains ).filter(
			( { domainName } ) => selectedDomainName === domainName
		);

		return (
			<>
				<SectionHeader
					label={ translate( 'Add New Mailboxes', {
						comment: 'This refers to Google Workspace user accounts',
					} ) }
				/>

				{ gsuiteUsers && userCanPurchaseGSuite && selectedDomainInfo && ! isRequestingDomains ? (
					<Card>
						<GSuiteNewUserList
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							extraValidation={ ( user ) => validateAgainstExistingUsers( user, gsuiteUsers ) }
							domains={ selectedDomainInfo }
							onReturnKeyPress={ this.handleReturnKeyPress }
							onUsersChange={ this.handleUsersChange }
							selectedDomainName={ getEligibleGSuiteDomain( selectedDomainName, domains ) }
							users={ users }
							validatedMailboxUuids={ validatedMailboxUuids }
						>
							<div className="gsuite-add-users__buttons">
								<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>

								<Button primary onClick={ this.handleContinue }>
									{ translate( 'Continue' ) }
								</Button>
							</div>
						</GSuiteNewUserList>
					</Card>
				) : (
					<AddEmailAddressesCardPlaceholder />
				) }
			</>
		);
	}

	render() {
		const {
			currentRoute,
			domains,
			googleMailProduct,
			selectedDomainName,
			selectedSite,
			translate,
		} = this.props;

		const selectedDomain = getSelectedDomain( {
			domains,
			selectedDomainName: selectedDomainName,
		} );

		const analyticsPath = emailManagementAddGSuiteUsers(
			':site',
			selectedDomainName ? ':domain' : undefined,
			':productType',
			currentRoute
		);

		const googleMailServiceFamily = getGoogleMailServiceFamily( googleMailProduct?.product_slug );

		return (
			<>
				<PageViewTracker path={ analyticsPath } title="Email Management > Add Google Users" />

				<QueryProductsList />

				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				{ selectedSite && <QueryGSuiteUsers siteId={ selectedSite.ID } /> }

				<Main wideLayout={ true }>
					<DocumentHead title={ translate( 'Add New Mailboxes' ) } />

					<EmailHeader />

					<HeaderCake onClick={ this.goToEmail }>
						{ googleMailServiceFamily + ': ' + selectedDomainName }
					</HeaderCake>

					<EmailVerificationGate
						noticeText={ translate( 'You must verify your email to purchase %(productFamily)s.', {
							args: { productFamily: googleMailServiceFamily },
							comment: '%(productFamily)s can be either "G Suite" or "Google Workspace"',
						} ) }
						noticeStatus="is-info"
					>
						{ selectedDomainName && googleMailProduct && hasGSuiteWithUs( selectedDomain ) && (
							<EmailPricingNotice
								domain={ selectedDomain }
								expiryDate={ getGSuiteExpiryDate( selectedDomain ) }
								mailboxRenewalCost={ getGSuiteMailboxRenewalCost( selectedDomain ) }
								mailboxPurchaseCost={ getGSuiteMailboxPurchaseCost( selectedDomain ) }
								product={ googleMailProduct }
								isMonthlyBilling={ isGoogleWorkspaceMonthly( googleMailProduct ) }
							/>
						) }
						{ this.renderAddGSuite() }
					</EmailVerificationGate>
				</Main>
			</>
		);
	}
}

GSuiteAddUsers.propTypes = {
	currentRoute: PropTypes.string,
	domains: PropTypes.array.isRequired,
	googleMailProduct: PropTypes.object,
	gsuiteUsers: PropTypes.array,
	isRequestingDomains: PropTypes.bool.isRequired,
	productType: PropTypes.oneOf( [ GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE ] ),
	selectedDomainName: PropTypes.string.isRequired,
	selectedSite: PropTypes.shape( {
		slug: PropTypes.string.isRequired,
	} ).isRequired,
	source: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default connect(
	( state, ownProps ) => {
		const selectedSite = getSelectedSite( state );
		const selectedSiteId = getSelectedSiteId( state );
		const domains = getDomainsBySiteId( state, selectedSiteId );

		const selectedDomain = getSelectedDomain( {
			domains,
			selectedDomainName: ownProps.selectedDomainName,
		} );

		const productSlug = getGSuiteProductSlug( selectedDomain );

		return {
			currentRoute: getCurrentRoute( state ),
			domains,
			googleMailProduct: productSlug ? getProductBySlug( state, productSlug ) : null,
			gsuiteUsers: getGSuiteUsers( state, selectedSiteId ),
			isRequestingDomains: isRequestingSiteDomains( state, selectedSiteId ),
			selectedSite,
			userCanPurchaseGSuite: canUserPurchaseGSuite( state ),
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( withCartKey( withShoppingCart( localize( GSuiteAddUsers ) ) ) );
