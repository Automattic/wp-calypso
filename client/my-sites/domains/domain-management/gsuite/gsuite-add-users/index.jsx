/** @format */
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

import AddEmailAddressesCard from './add-users';
import { domainManagementAddGSuiteUsers, domainManagementEmail } from 'my-sites/domains/paths';
import DomainManagementHeader from 'my-sites/domains/domain-management/components/header';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { fetchByDomain, fetchBySiteId } from 'state/google-apps-users/actions';
import { getDecoratedSiteDomains, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { hasGoogleAppsSupportedDomain } from 'lib/domains';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySiteDomains from 'components/data/query-site-domains';
import SectionHeader from 'components/section-header';

class GSuiteAddUsers extends React.Component {
	componentDidMount() {
		const { domains, isRequestingDomains } = this.props;
		this.redirectIfCannotAddEmail( domains, isRequestingDomains );
	}

	shouldComponentUpdate( nextProps ) {
		const { domains, isRequestingDomains } = nextProps;
		this.redirectIfCannotAddEmail( domains, isRequestingDomains );
		if ( isRequestingDomains || ! domains.length ) {
			return false;
		}
		return true;
	}

	redirectIfCannotAddEmail( domains, isRequestingDomains ) {
		if ( isRequestingDomains || hasGoogleAppsSupportedDomain( domains ) ) {
			return;
		}
		this.goToEmail();
	}

	goToEmail = () => {
		page( domainManagementEmail( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};

	renderAddGSuite() {
		const {
			domains,
			googleAppsUsers,
			googleAppsUsersLoaded,
			isRequestingDomains,
			selectedDomainName,
			selectedSite,
			translate,
		} = this.props;

		return (
			<Fragment>
				<SectionHeader label={ translate( 'Add G Suite' ) } />
				<AddEmailAddressesCard
					domains={ domains }
					isRequestingSiteDomains={ isRequestingDomains }
					gsuiteUsers={ googleAppsUsers }
					gsuiteUsersLoaded={ googleAppsUsersLoaded }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
				/>
			</Fragment>
		);
	}

	render() {
		const { translate, selectedDomainName, selectedSite } = this.props;

		const analyticsPath = domainManagementAddGSuiteUsers(
			':site',
			selectedDomainName ? ':domain' : undefined
		);
		return (
			<Fragment>
				<PageViewTracker path={ analyticsPath } title="Domain Management > Add G Suite Users" />
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
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
	isRequestingDomains: PropTypes.bool.isRequired,
	googleAppsUsers: PropTypes.array.isRequired,
	googleAppsUsersLoaded: PropTypes.bool.isRequired,
	selectedDomainName: PropTypes.string.isRequired,
	selectedSite: PropTypes.shape( {
		slug: PropTypes.string.isRequired,
	} ).isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect(
	state => {
		const selectedSite = getSelectedSite( state );
		const siteId = get( selectedSite, 'ID', null );
		return {
			domains: getDecoratedSiteDomains( state, siteId ),
			isRequestingDomains: isRequestingSiteDomains( state, siteId ),
			selectedSite,
		};
	},
	( dispatch, { selectedDomainName } ) => {
		const googleAppsUsersFetcher = selectedDomainName
			? () => fetchByDomain( selectedDomainName )
			: siteId => fetchBySiteId( siteId );

		return {
			fetchGoogleAppsUsers: siteId => dispatch( googleAppsUsersFetcher( siteId ) ),
		};
	}
)( localize( GSuiteAddUsers ) );
