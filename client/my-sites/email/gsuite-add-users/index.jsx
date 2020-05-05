/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import { addItems } from 'lib/cart/actions';
import AddEmailAddressesCardPlaceholder from './add-users-placeholder';
import { Button, Card } from '@automattic/components';
import DomainManagementHeader from 'my-sites/domains/domain-management/components/header';
import {
	emailManagementAddGSuiteUsers,
	emailManagementNewGSuiteAccount,
	emailManagement,
} from 'my-sites/email/paths';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { getDomainsWithForwards } from 'state/selectors/get-email-forwards';
import { getEligibleGSuiteDomain, getGSuiteSupportedDomains } from 'lib/gsuite';
import {
	areAllUsersValid,
	getItemsForCart,
	newUsers,
	validateAgainstExistingUsers,
} from 'lib/gsuite/new-users';
import { getSelectedSite } from 'state/ui/selectors';
import { GSUITE_BASIC_SLUG, GSUITE_BUSINESS_SLUG } from 'lib/gsuite/constants';
import GSuiteNewUserList from 'components/gsuite/gsuite-new-user-list';
import Main from 'components/main';
import Notice from 'components/notice';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySiteDomains from 'components/data/query-site-domains';
import SectionHeader from 'components/section-header';
import QueryEmailForwards from 'components/data/query-email-forwards';
import QueryGSuiteUsers from 'components/data/query-gsuite-users';
import getGSuiteUsers from 'state/selectors/get-gsuite-users';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class GSuiteAddUsers extends React.Component {
	state = {
		users: [],
	};

	static getDerivedStateFromProps(
		{ domains, isRequestingDomains, selectedDomainName },
		{ users }
	) {
		if ( ! isRequestingDomains && 0 === users.length ) {
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
		const { domains, planType, selectedSite } = this.props;
		const { users } = this.state;
		const canContinue = areAllUsersValid( users );

		this.recordClickEvent( 'calypso_email_management_gsuite_add_users_continue_button_click' );

		if ( canContinue ) {
			addItems(
				getItemsForCart(
					domains,
					'business' === planType ? GSUITE_BUSINESS_SLUG : GSUITE_BASIC_SLUG,
					users
				)
			);
			page( '/checkout/' + selectedSite.slug );
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
		page( emailManagement( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};

	renderAddGSuite() {
		const {
			domains,
			domainsWithForwards,
			gsuiteUsers,
			isRequestingDomains,
			selectedDomainName,
			translate,
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
							'Please note that email forwards are not compatible with G Suite, and will be disabled once G Suite is added to this domain. The following domains have forwards:'
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
				{ selectedDomainInfo.map( ( domain ) => {
					return <QueryEmailForwards key={ domain.domain } domainName={ domain.domain } />;
				} ) }
				<SectionHeader label={ translate( 'Add G Suite' ) } />
				{ gsuiteUsers && selectedDomainInfo && ! isRequestingDomains ? (
					<Card>
						<GSuiteNewUserList
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
		const { translate, planType, selectedDomainName, selectedSite } = this.props;

		const analyticsPath = planType
			? emailManagementNewGSuiteAccount( ':site', ':domain', ':planType' )
			: emailManagementAddGSuiteUsers( ':site', selectedDomainName ? ':domain' : undefined );
		return (
			<Fragment>
				<PageViewTracker path={ analyticsPath } title="Domain Management > Add G Suite Users" />
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				{ selectedSite && <QueryGSuiteUsers siteId={ selectedSite.ID } /> }
				<Main>
					<DomainManagementHeader
						onClick={ this.goToEmail }
						selectedDomainName={ selectedDomainName }
					>
						{ translate( 'Add G Suite' ) }
					</DomainManagementHeader>

					<EmailVerificationGate
						noticeText={ translate( 'You must verify your email to purchase G Suite.' ) }
						noticeStatus="is-info"
					>
						{ this.renderAddGSuite() }
					</EmailVerificationGate>
				</Main>
			</Fragment>
		);
	}
}

GSuiteAddUsers.propTypes = {
	domains: PropTypes.array.isRequired,
	gsuiteUsers: PropTypes.array,
	isRequestingDomains: PropTypes.bool.isRequired,
	planType: PropTypes.oneOf( [ 'basic', 'business' ] ),
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
			domains,
			domainsWithForwards: getDomainsWithForwards( state, domains ),
			gsuiteUsers: getGSuiteUsers( state, siteId ),
			isRequestingDomains: isRequestingSiteDomains( state, siteId ),
			selectedSite,
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( localize( GSuiteAddUsers ) );
