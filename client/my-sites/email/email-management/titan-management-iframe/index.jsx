/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import DocumentHead from 'calypso/components/data/document-head';
import { emailManagement } from 'calypso/my-sites/email/paths';
import EmptyContent from 'calypso/components/empty-content';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import { isEnabled } from '@automattic/calypso-config';
import Main from 'calypso/components/main';
import QueryEmailAccounts from 'calypso/components/data/query-email-accounts';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import TitanControlPanelLoginCard from 'calypso/my-sites/email/email-management/titan-control-panel-login-card';

class TitanManagementIframe extends React.Component {
	static propTypes = {
		canManageSite: PropTypes.bool.isRequired,
		currentRoute: PropTypes.string,
		domainName: PropTypes.string.isRequired,
		hasSiteDomainsLoaded: PropTypes.bool.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	renderManagementSection() {
		const { domainName } = this.props;
		const selectedDomain = this.props.domains
			.filter( function ( domain ) {
				return domain?.name === domainName;
			} )
			.pop();
		if ( ! selectedDomain ) {
			return null;
		}
		return <TitanControlPanelLoginCard domain={ selectedDomain } />;
	}

	render() {
		const {
			canManageSite,
			currentRoute,
			domainName,
			selectedSiteId,
			selectedSiteSlug,
			translate,
		} = this.props;

		if ( ! canManageSite ) {
			return (
				<Main>
					<SidebarNavigation />
					<EmptyContent
						title={ translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}
		const emailManagementPath = emailManagement( selectedSiteSlug, domainName, currentRoute );

		return (
			<Main className="titan-management-iframe" wideLayout>
				{ isEnabled( 'email-accounts/enabled' ) && (
					<QueryEmailAccounts siteId={ selectedSiteId } />
				) }
				<QuerySiteDomains siteId={ selectedSiteId } />
				<DocumentHead title={ translate( 'Email Management' ) } />
				<SidebarNavigation />

				<Header backHref={ emailManagementPath } selectedDomainName={ domainName }>
					{ translate( 'Email Settings' ) }
				</Header>
				{ this.renderManagementSection() }
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		currentRoute: getCurrentRoute( state ),
		canManageSite: canCurrentUser( state, selectedSiteId, 'manage_options' ),
		domains: getDomainsBySiteId( state, selectedSiteId ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, selectedSiteId ),
		selectedSiteId,
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( TitanManagementIframe ) );
