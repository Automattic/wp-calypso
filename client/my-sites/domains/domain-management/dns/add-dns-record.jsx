import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import {
	domainManagementDns,
	domainManagementEdit,
	domainManagementList,
} from 'calypso/my-sites/domains/paths';
import { fetchDns } from 'calypso/state/domains/dns/actions';
import { getDomainDns } from 'calypso/state/domains/dns/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DnsAddNew from './dns-add-new';

import './add-dns-record.scss';

class AddDnsRecprd extends Component {
	static propTypes = {
		dns: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	getRecordBeingEdited() {
		const { dns } = this.props;
		const searchParams = new URLSearchParams( window.location.search );
		const recordId = searchParams.get( 'record' );

		if ( recordId ) {
			return dns.records && dns.records.find( ( record ) => recordId === record.id );
		}
		return null;
	}

	renderBreadcrumbs() {
		const { translate, selectedSite, currentRoute, selectedDomainName } = this.props;
		const recordBeingEdited = this.getRecordBeingEdited();

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
			{
				label: recordBeingEdited
					? translate( 'Edit record', { comment: 'DNS record' } )
					: translate( 'Add a record', { comment: 'DNS record' } ),
			},
		];

		const mobileItem = {
			label: translate( 'Back to DNS records', {
				comment: 'Link to return to the DNs records management page of a domain ',
			} ),
			href: domainManagementDns( selectedSite.slug, selectedDomainName ),
			showBackArrow: true,
		};

		return (
			<Breadcrumbs items={ items } mobileItem={ mobileItem } buttons={ [] } mobileButtons={ [] } />
		);
	};

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
		const recordBeingEdited = this.getRecordBeingEdited();
		const headerText = recordBeingEdited
			? translate( 'Edit DNS record' )
			: translate( 'Add a new DNS record' );

		return (
			<Main wideLayout className="add-dns-record">
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				<div className="add-dns-record__fullwidth">
					{ this.renderBreadcrumbs() }
					<FormattedHeader brandFont headerText={ headerText } align="left" />
					<p className="add-dns-record__mobile-subtitle">{ mobileSubtitleText }</p>
				</div>
				<div className="add-dns-record__main">
					<DnsAddNew
						isSubmittingForm={ dns.isSubmittingForm }
						selectedDomainName={ selectedDomainName }
						goBack={ this.goBack }
						recordToEdit={ recordBeingEdited }
					/>
				</div>
				<div className="add-dns-record__sidebar">
					<div>
						<strong>
							{ translate( 'What are these used for?', {
								comment: '"These" refers to DNS records',
							} ) }
						</strong>
						<p>{ explanationText }</p>
					</div>
				</div>
			</Main>
		);
	}

	render() {
		const { selectedDomainName } = this.props;

		return (
			<Fragment>
				<QueryDomainDns domain={ selectedDomainName } />
				{ this.renderMain() }
			</Fragment>
		);
	}
}

export default connect(
	( state, { selectedDomainName } ) => {
		const selectedSite = getSelectedSite( state );
		const dns = getDomainDns( state, selectedDomainName );

		return {
			selectedSite,
			dns,
			currentRoute: getCurrentRoute( state ),
		};
	},
	{ successNotice, errorNotice, fetchDns }
)( localize( AddDnsRecprd ) );
