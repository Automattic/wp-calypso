import { CompactCard as Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import VerticalNav from 'calypso/components/vertical-nav';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain, isRegisteredDomain } from 'calypso/lib/domains';
import { domainConnect } from 'calypso/lib/domains/constants';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import DnsRecordsList from 'calypso/my-sites/domains/domain-management/dns/dns-records-list';
import { domainManagementEdit, domainManagementNameServers } from 'calypso/my-sites/domains/paths';
import { getDomainDns } from 'calypso/state/domains/dns/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DnsTemplates from '../name-servers/dns-templates';
import DnsAddNew from './dns-add-new';
import DnsDetails from './dns-details';
import DomainConnectRecord from './domain-connect-record';
import './style.scss';

class DnsRecords extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		dns: PropTypes.object.isRequired,
		showPlaceholder: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	renderDnsTemplates() {
		const { domains } = this.props;
		const selectedDomain = getSelectedDomain( domains );

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
		const { dns, domains, selectedDomainName, selectedSite, translate } = this.props;
		const domain = getSelectedDomain( domains );
		const hasWpcomNameservers = domain?.hasWpcomNameservers ?? false;
		const domainConnectEnabled = some( dns.records, {
			name: domainConnect.DISCOVERY_TXT_RECORD_NAME,
			data: domainConnect.API_URL,
			type: 'TXT',
		} );
		const headerText = translate( 'DNS Records' );

		return (
			<Main wideLayout className="dns-records">
				<BodySectionCssClass bodyClass={ [ 'dns__body-white' ] } />
				<DocumentHead title={ headerText } />
				<FormattedHeader brandFont headerText={ headerText } align="left" />
				<DnsDetails />
				<DnsRecordsList
					dns={ dns }
					selectedSite={ selectedSite }
					selectedDomainName={ selectedDomainName }
				/>
				{ /*<DomainConnectRecord*/ }
				{ /*	enabled={ domainConnectEnabled }*/ }
				{ /*	selectedDomainName={ selectedDomainName }*/ }
				{ /*	hasWpcomNameservers={ hasWpcomNameservers }*/ }
				{ /*/>*/ }
				{ /*<DnsAddNew*/ }
				{ /*	isSubmittingForm={ dns.isSubmittingForm }*/ }
				{ /*	selectedDomainName={ selectedDomainName }*/ }
				{ /*/>*/ }
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
		const { domains, selectedSite, selectedDomainName, currentRoute } = this.props;
		let path;

		if ( isRegisteredDomain( getSelectedDomain( domains ) ) ) {
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
} )( localize( DnsRecords ) );
