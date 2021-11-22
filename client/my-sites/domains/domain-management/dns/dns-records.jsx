import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isRegisteredDomain } from 'calypso/lib/domains';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import DnsRecordsList from 'calypso/my-sites/domains/domain-management/dns/dns-records-list';
import EmailSetup from 'calypso/my-sites/domains/domain-management/email-setup';
import {
	domainManagementEdit,
	domainManagementNameServers,
	domainManagementList,
} from 'calypso/my-sites/domains/paths';
import { fetchDns } from 'calypso/state/domains/dns/actions';
import { getDomainDns } from 'calypso/state/domains/dns/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DnsAddNewRecordButton from './dns-add-new-record-button';
import DnsDetails from './dns-details';
import DnsMenuOptionsButton from './dns-menu-options-button';
import './style.scss';

class DnsRecords extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		dns: PropTypes.object.isRequired,
		showPlaceholder: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	renderBreadcrumbs = () => {
		const { domains, translate, selectedSite, currentRoute, selectedDomainName, dns } = this.props;
		const selectedDomain = domains?.find( ( domain ) => domain?.name === selectedDomainName );
		const pointsToWpcom = selectedDomain?.pointsToWpcom ?? false;

		const items = [
			{
				label: translate( 'Domains' ),
				href: domainManagementList( selectedSite.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute ),
			},
			{ label: translate( 'DNS records' ) },
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: domainManagementNameServers( selectedSite.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		const buttons = [
			<DnsAddNewRecordButton
				key="add-new-record-button"
				site={ selectedSite.slug }
				domain={ selectedDomainName }
			/>,
			<DnsMenuOptionsButton
				key="menu-options-button"
				domain={ selectedDomainName }
				dns={ dns }
				pointsToWpcom={ pointsToWpcom }
			/>,
		];

		return (
			<Breadcrumbs
				items={ items }
				mobileItem={ mobileItem }
				buttons={ buttons }
				mobileButtons={ buttons }
			/>
		);
	};

	renderMain() {
		const { dns, selectedDomainName, selectedSite, translate } = this.props;
		const headerText = translate( 'DNS Records' );

		return (
			<Main wideLayout className="dns-records">
				<BodySectionCssClass bodyClass={ [ 'dns__body-white' ] } />
				<DocumentHead title={ headerText } />
				{ this.renderBreadcrumbs() }
				<FormattedHeader brandFont headerText={ headerText } align="left" />
				<DnsDetails />
				<DnsRecordsList
					dns={ dns }
					selectedSite={ selectedSite }
					selectedDomainName={ selectedDomainName }
				/>
				<EmailSetup selectedDomainName={ selectedDomainName } />
			</Main>
		);
	}

	render() {
		const { showPlaceholder, selectedDomainName } = this.props;

		return (
			<Fragment>
				<QueryDomainDns domain={ selectedDomainName } />
				{ showPlaceholder ? (
					<DomainMainPlaceholder breadcrumbs={ this.renderBreadcrumbs } />
				) : (
					this.renderMain()
				) }
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

export default connect(
	( state, { selectedDomainName } ) => {
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
	},
	{ successNotice, errorNotice, fetchDns }
)( localize( DnsRecords ) );
