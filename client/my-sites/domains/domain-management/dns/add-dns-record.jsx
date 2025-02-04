import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { DNS_RECORDS_ADD, DNS_RECORDS_EDITING_OR_DELETING } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import ExternalLink from 'calypso/components/external-link';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import {
	domainManagementDns,
	domainManagementEdit,
	domainManagementList,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import { fetchDns } from 'calypso/state/domains/dns/actions';
import { getDomainDns } from 'calypso/state/domains/dns/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DnsAddNew from './dns-add-new';
import './add-dns-record.scss';

class AddDnsRecord extends Component {
	static propTypes = {
		dns: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	getRecordBeingEdited() {
		const { dns } = this.props;
		const searchParams = new URLSearchParams( window.location.search );
		const recordId = searchParams.get( 'recordId' );

		return recordId ? dns.records?.find( ( record ) => recordId === record.id ) : null;
	}

	renderHeader() {
		const { translate, selectedSite, currentRoute, selectedDomainName } = this.props;
		const {
			showBreadcrumb = true,
			titleOverride,
			subtitleOverride,
		} = this.props.context?.params || {};

		const recordBeingEdited = this.getRecordBeingEdited();
		const dnsSupportPageLink = (
			<ExternalLink
				href={
					recordBeingEdited
						? localizeUrl( DNS_RECORDS_EDITING_OR_DELETING )
						: localizeUrl( DNS_RECORDS_ADD )
				}
				target="_blank"
				icon={ false }
			/>
		);

		const items = [
			{
				label: isUnderDomainManagementAll( currentRoute )
					? translate( 'All Domains' )
					: translate( 'Domains' ),
				href: domainManagementList(
					selectedSite?.slug,
					currentRoute,
					selectedSite?.options?.is_domain_only
				),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'DNS records' ),
				href: domainManagementDns( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{
				label: recordBeingEdited
					? translate( 'Edit record', { comment: 'DNS record' } )
					: translate( 'Add a new DNS record', { comment: 'DNS record' } ),
				subtitle: translate(
					'Add a new DNS record to your site. {{supportLink}}Learn more{{/supportLink}}',
					{
						components: {
							supportLink: dnsSupportPageLink,
						},
					}
				),
			},
		];

		const mobileItem = {
			label: translate( 'Back to DNS records', {
				comment: 'Link to return to the DNs records management page of a domain ',
			} ),
			href: domainManagementDns( selectedSite?.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		return (
			<DomainHeader
				items={ showBreadcrumb ? items : [] }
				mobileItem={ showBreadcrumb ? mobileItem : null }
				titleOverride={ titleOverride }
				subtitleOverride={ subtitleOverride }
			/>
		);
	}

	goBack = () => {
		const { selectedSite, selectedDomainName, currentRoute } = this.props;
		page( domainManagementDns( selectedSite?.slug, selectedDomainName, currentRoute ) );
	};

	renderMain() {
		const { domains, dns, selectedDomainName, selectedSite, translate } = this.props;
		const recordBeingEdited = this.getRecordBeingEdited();

		const dnsSupportPageLink = recordBeingEdited
			? 'edit-or-delete-dns-record'
			: 'add-a-new-dns-record';

		const explanationText = translate(
			'Custom DNS records allow you to connect your domain to third-party services that are not hosted on WordPress.com, such as an email provider. {{supportLink}}Learn more{{/supportLink}}.',
			{
				components: {
					supportLink: (
						<InlineSupportLink supportContext={ dnsSupportPageLink } showIcon={ false } />
					),
				},
			}
		);
		const selectedDomain = domains?.find( ( domain ) => domain?.name === selectedDomainName );

		return (
			<Main wideLayout className="add-dns-record">
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				<div className="add-dns-record__fullwidth">{ this.renderHeader() }</div>
				<div className="add-dns-record__main">
					<DnsAddNew
						isSubmittingForm={ dns.isSubmittingForm }
						selectedDomain={ selectedDomain }
						selectedDomainName={ selectedDomainName }
						selectedSiteSlug={ selectedSite?.slug }
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
		const domains = getDomainsBySiteId( state, selectedSite?.ID );
		const dns = getDomainDns( state, selectedDomainName );

		return {
			selectedSite,
			domains,
			dns,
			currentRoute: getCurrentRoute( state ),
		};
	},
	{ successNotice, errorNotice, fetchDns }
)( localize( AddDnsRecord ) );
