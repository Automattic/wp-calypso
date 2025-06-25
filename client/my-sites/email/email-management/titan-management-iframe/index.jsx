import { isEnabled } from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titleCase from 'to-title-case';
import DocumentHead from 'calypso/components/data/document-head';
import QueryEmailAccounts from 'calypso/components/data/query-email-accounts';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { getTitanProductName } from 'calypso/lib/titan';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import TitanControlPanelLoginCard from 'calypso/my-sites/email/email-management/titan-control-panel-login-card';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

class TitanManagementIframe extends Component {
	static propTypes = {
		canManageSite: PropTypes.bool.isRequired,
		context: PropTypes.string,
		currentRoute: PropTypes.string,
		domainName: PropTypes.string.isRequired,
		hasSiteDomainsLoaded: PropTypes.bool.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	renderManagementSection() {
		const { context, domainName } = this.props;
		const selectedDomain = this.props.domains
			.filter( function ( domain ) {
				return domain?.name === domainName;
			} )
			.pop();
		if ( ! selectedDomain ) {
			return null;
		}
		return <TitanControlPanelLoginCard domain={ selectedDomain } context={ context } />;
	}

	render() {
		const { canManageSite, currentRoute, domainName, selectedSiteId, selectedSiteSlug, translate } =
			this.props;

		if ( ! canManageSite ) {
			return (
				<Main>
					<EmptyContent title={ translate( 'You are not authorized to view this page' ) } />
				</Main>
			);
		}
		const emailManagementPath = getEmailManagementPath(
			selectedSiteSlug,
			domainName,
			currentRoute
		);
		const pageTitle = translate( '%(titanProductName)s settings', {
			args: {
				titanProductName: getTitanProductName(),
			},
			comment:
				'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
		} );

		return (
			<Main className="titan-management-iframe" wideLayout>
				{ isEnabled( 'email-accounts/enabled' ) && (
					<QueryEmailAccounts siteId={ selectedSiteId } />
				) }
				<QuerySiteDomains siteId={ selectedSiteId } />
				<DocumentHead title={ titleCase( pageTitle ) } />

				<Header backHref={ emailManagementPath } selectedDomainName={ domainName }>
					{ pageTitle }
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
