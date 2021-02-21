/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import DnsAddNew from './dns-add-new';
import DnsDetails from './dns-details';
import DnsList from './dns-list';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import { domainManagementEdit, domainManagementNameServers } from 'calypso/my-sites/domains/paths';
import { getSelectedDomain, isMappedDomain, isRegisteredDomain } from 'calypso/lib/domains';
import { CompactCard as Card } from '@automattic/components';
import DnsTemplates from '../name-servers/dns-templates';
import VerticalNav from 'calypso/components/vertical-nav';
import DomainConnectRecord from './domain-connect-record';
import { domainConnect } from 'calypso/lib/domains/constants';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getDomainDns } from 'calypso/state/domains/dns/selectors';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

/**
 * Style dependencies
 */
import './style.scss';

class Dns extends React.Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		dns: PropTypes.object.isRequired,
		showPlaceholder: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	state = {
		addNew: true,
	};

	renderDnsTemplates() {
		const selectedDomain = getSelectedDomain( this.props );

		if ( ! selectedDomain || ! isMappedDomain( selectedDomain ) ) {
			return null;
		}

		return (
			<VerticalNav>
				<DnsTemplates selectedDomainName={ this.props.selectedDomainName } />
			</VerticalNav>
		);
	}

	renderMain() {
		const { dns, selectedDomainName, selectedSite, translate } = this.props;
		const domain = getSelectedDomain( this.props );
		const hasWpcomNameservers = domain?.hasWpcomNameservers ?? false;
		const domainConnectEnabled = some( dns.records, {
			name: domainConnect.DISCOVERY_TXT_RECORD_NAME,
			data: domainConnect.API_URL,
			type: 'TXT',
		} );

		return (
			<Main className="dns">
				<Header onClick={ this.goBack } selectedDomainName={ selectedDomainName }>
					{ translate( 'DNS Records' ) }
				</Header>
				<Card>
					<DnsDetails />
					<DnsList
						dns={ dns }
						selectedSite={ selectedSite }
						selectedDomainName={ selectedDomainName }
					/>
					<DomainConnectRecord
						enabled={ domainConnectEnabled }
						selectedDomainName={ selectedDomainName }
						hasWpcomNameservers={ hasWpcomNameservers }
					/>
					<DnsAddNew
						isSubmittingForm={ dns.isSubmittingForm }
						selectedDomainName={ selectedDomainName }
					/>
				</Card>
				{ this.renderDnsTemplates() }
			</Main>
		);
	}

	render() {
		const { showPlaceholder, selectedDomainName, selectedSite } = this.props;

		return (
			<Fragment>
				<QuerySiteDomains siteId={ selectedSite.ID } />
				<QueryDomainDns domain={ selectedDomainName } />
				{ showPlaceholder ? <DomainMainPlaceholder goBack={ this.goBack } /> : this.renderMain() }
			</Fragment>
		);
	}

	goBack = () => {
		const { selectedSite, selectedDomainName, currentRoute } = this.props;
		let path;

		if ( isRegisteredDomain( getSelectedDomain( this.props ) ) ) {
			path = domainManagementNameServers( selectedSite.slug, selectedDomainName, currentRoute );
		} else {
			path = domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute );
		}

		page( path );
	};
}

export default connect( ( state, { selectedDomainName } ) => {
	const selectedSite = getSelectedSite( state );
	const domains = getDomainsBySiteId( state, selectedSite.ID );
	const isRequestingDomains = isRequestingSiteDomains( state, selectedSite.ID );
	const dns = getDomainDns( state, selectedDomainName );
	const showPlaceholder = ! dns.hasLoadedFromServer || isRequestingDomains;

	return {
		selectedSite,
		domains,
		dns,
		showPlaceholder,
		currentRoute: getCurrentRoute( state ),
	};
} )( localize( Dns ) );
