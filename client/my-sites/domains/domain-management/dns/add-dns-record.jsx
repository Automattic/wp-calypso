import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import VerticalNav from 'calypso/components/vertical-nav';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import {
	domainManagementDns,
	domainManagementEdit,
	domainManagementList,
} from 'calypso/my-sites/domains/paths';
import { fetchDns } from 'calypso/state/domains/dns/actions';
import { getDomainDns } from 'calypso/state/domains/dns/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DnsTemplates from '../name-servers/dns-templates';
import DnsAddNew from './dns-add-new';

import './add-dns-record.scss';

class AddDnsRecprd extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		dns: PropTypes.object.isRequired,
		showPlaceholder: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	constructor( props ) {
		super( props );
		this.onRestoreSuccess = this.onRestoreSuccess.bind( this );
		this.onRestoreError = this.onRestoreError.bind( this );
	}

	onRestoreSuccess() {
		const { translate, selectedDomainName } = this.props;
		this.props.fetchDns( selectedDomainName, true );
		this.props.successNotice(
			translate( 'Yay, the name servers have been successfully updated!' )
		);
	}

	onRestoreError( errorMessage ) {
		this.props.errorNotice( errorMessage );
	}

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

	renderBreadcrumbs() {
		const { translate, selectedSite, currentRoute, selectedDomainName } = this.props;

		const items = [
			{
				label: translate( 'Domains' ),
				href: domainManagementList( selectedSite.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'DNS records' ),
				href: domainManagementDns( selectedSite.slug, selectedDomainName ),
			},
			'Add a record',
		];

		const mobileItem = {
			label: translate( 'Back to DNS records' ),
			href: domainManagementDns( selectedSite.slug, selectedDomainName ),
			showBackArrow: true,
		};

		return (
			<Breadcrumbs items={ items } mobileItem={ mobileItem } buttons={ [] } mobileButtons={ [] } />
		);
	}

	goBack = () => {
		const { selectedSite, selectedDomainName } = this.props;
		page( domainManagementDns( selectedSite.slug, selectedDomainName ) );
	};

	renderMain() {
		const { dns, selectedDomainName, translate } = this.props;
		const dnsSupportPageLink = (
			<ExternalLink
				href={ localizeUrl( 'https://wordpress.com/support/domains/custom-dns/' ) }
				target="_blank"
				icon={ false }
			/>
		);
		const mobileSubtitleText = translate(
			'Add a new DNS record to your site. {{supportLink}}Learn more{{/supportLink}}',
			{
				components: {
					supportLink: dnsSupportPageLink,
				},
			}
		);
		const explanationText = translate(
			'Custom DNS records allow you to connect your domain to third-party services that are not hosted on WordPress.com, such as an email provider. {{supportLink}}Learn more{{/supportLink}}.',
			{
				components: {
					supportLink: dnsSupportPageLink,
				},
			}
		);

		return (
			<Main wideLayout className="add-dns-record">
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				<div className="add-dns-record__fullwidth">
					{ this.renderBreadcrumbs() }
					<FormattedHeader brandFont headerText="Add a new DNS record" align="left" />
					<p className="add-dns-record__mobile-subtitle">{ mobileSubtitleText }</p>
				</div>
				<div className="add-dns-record__main">
					<DnsAddNew
						isSubmittingForm={ dns.isSubmittingForm }
						selectedDomainName={ selectedDomainName }
						goBack={ this.goBack }
					/>
				</div>
				<div className="add-dns-record__sidebar">
					<div>
						<strong>{ translate( 'What are these used for?' ) }</strong>
						<p>{ explanationText }</p>
					</div>
				</div>
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
)( localize( AddDnsRecprd ) );
