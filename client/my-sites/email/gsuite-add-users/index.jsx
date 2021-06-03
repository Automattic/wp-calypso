/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import AddEmailAddressesCardPlaceholder from './add-users-placeholder';
import { Button, Card } from '@automattic/components';
import DocumentHead from 'calypso/components/data/document-head';
import EmailHeader from 'calypso/my-sites/email/email-header';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import {
	emailManagementAddGSuiteUsers,
	emailManagementNewGSuiteAccount,
	emailManagement,
} from 'calypso/my-sites/email/paths';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import {
	getEligibleGSuiteDomain,
	getGoogleMailServiceFamily,
	getGSuiteSupportedDomains,
	getProductSlug,
} from 'calypso/lib/gsuite';
import {
	areAllUsersValid,
	getItemsForCart,
	newUsers,
	validateAgainstExistingUsers,
} from 'calypso/lib/gsuite/new-users';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import SectionHeader from 'calypso/components/section-header';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import QueryGSuiteUsers from 'calypso/components/data/query-gsuite-users';
import getGSuiteUsers from 'calypso/state/selectors/get-gsuite-users';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { getProductsList } from 'calypso/state/products-list/selectors/get-products-list';

/**
 * Style dependencies
 */
import './style.scss';

class GSuiteAddUsers extends React.Component {
	state = {
		users: [],
	};

	isMounted = false;

	static getDerivedStateFromProps(
		{ domains, isRequestingDomains, selectedDomainName, userCanPurchaseGSuite },
		{ users }
	) {
		if ( ! isRequestingDomains && 0 === users.length && userCanPurchaseGSuite ) {
			const domainName = getEligibleGSuiteDomain( selectedDomainName, domains );
			if ( '' !== domainName ) {
				return {
					users: newUsers( domainName ),
				};
			}
		}
		return null;
	}

	handleContinue = () => {
		const { domains, productType, selectedSite } = this.props;
		const { users } = this.state;
		const canContinue = areAllUsersValid( users );

		this.recordClickEvent( 'calypso_email_management_gsuite_add_users_continue_button_click' );

		if ( canContinue ) {
			this.props.shoppingCartManager
				.addProductsToCart(
					getItemsForCart( domains, getProductSlug( productType ), users ).map( ( item ) =>
						fillInSingleCartItemAttributes( item, this.props.productsList )
					)
				)
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
		const { recordTracksEvent, selectedDomainName } = this.props;
		const { users } = this.state;
		recordTracksEvent( eventName, {
			domain_name: selectedDomainName,
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
			domainsWithForwards,
			gsuiteUsers,
			isRequestingDomains,
			selectedDomainName,
			translate,
			userCanPurchaseGSuite,
		} = this.props;

		const { users } = this.state;

		const selectedDomainInfo = getGSuiteSupportedDomains( domains ).filter(
			( { domainName } ) => selectedDomainName === domainName
		);
		const canContinue = areAllUsersValid( users );

		return (
			<Fragment>
				{ domainsWithForwards.length ? (
					<Notice showDismiss={ false } status="is-warning">
						{ translate(
							'Please note that email forwards are not compatible with %(productFamily)s, and will be disabled once %(productFamily)s is added to this domain. The following domains have forwards:',
							{
								args: { productFamily: getGoogleMailServiceFamily() },
								comment: '%(productFamily)s can be either "G Suite" or "Google Workspace"',
							}
						) }
						<ul>
							{ domainsWithForwards.map( ( domainName ) => {
								return <li key={ domainName }>{ domainName }</li>;
							} ) }
						</ul>
					</Notice>
				) : (
					''
				) }

				{ userCanPurchaseGSuite &&
					selectedDomainInfo.map( ( domain ) => {
						return <QueryEmailForwards key={ domain.domain } domainName={ domain.domain } />;
					} ) }

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
							onUsersChange={ this.handleUsersChange }
							selectedDomainName={ getEligibleGSuiteDomain( selectedDomainName, domains ) }
							users={ users }
							onReturnKeyPress={ this.handleReturnKeyPress }
						>
							<div className="gsuite-add-users__buttons">
								<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>
								<Button primary disabled={ ! canContinue } onClick={ this.handleContinue }>
									{ translate( 'Continue' ) }
								</Button>
							</div>
						</GSuiteNewUserList>
					</Card>
				) : (
					<AddEmailAddressesCardPlaceholder />
				) }
			</Fragment>
		);
	}

	render() {
		const {
			currentRoute,
			isNewAccount,
			productType,
			translate,
			selectedDomainName,
			selectedSite,
		} = this.props;

		const analyticsPath = isNewAccount
			? emailManagementNewGSuiteAccount( ':site', ':domain', ':productType', currentRoute )
			: emailManagementAddGSuiteUsers(
					':site',
					selectedDomainName ? ':domain' : undefined,
					':productType',
					currentRoute
			  );

		const googleMailServiceFamily = getGoogleMailServiceFamily( getProductSlug( productType ) );

		return (
			<>
				<PageViewTracker path={ analyticsPath } title="Email Management > Add Google Users" />

				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

				{ selectedSite && <QueryGSuiteUsers siteId={ selectedSite.ID } /> }

				<Main wideLayout={ true }>
					<DocumentHead title={ translate( 'Add New Mailboxes' ) } />

					<EmailHeader currentRoute={ currentRoute } selectedSite={ selectedSite } />

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
	gsuiteUsers: PropTypes.array,
	isNewAccount: PropTypes.bool,
	isRequestingDomains: PropTypes.bool.isRequired,
	productType: PropTypes.oneOf( [ GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE ] ),
	selectedDomainName: PropTypes.string.isRequired,
	selectedSite: PropTypes.shape( {
		slug: PropTypes.string.isRequired,
	} ).isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		const siteId = get( selectedSite, 'ID', null );
		const domains = getDomainsBySiteId( state, siteId );
		return {
			currentRoute: getCurrentRoute( state ),
			domains,
			domainsWithForwards: getDomainsWithForwards( state, domains ),
			gsuiteUsers: getGSuiteUsers( state, siteId ),
			isRequestingDomains: isRequestingSiteDomains( state, siteId ),
			productsList: getProductsList( state ),
			selectedSite,
			userCanPurchaseGSuite: canUserPurchaseGSuite( state ),
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( withShoppingCart( localize( GSuiteAddUsers ) ) );
