import { englishLocales } from '@automattic/i18n-utils';
import { Icon, info } from '@wordpress/icons';
import i18n, { getLocaleSlug, localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import InfoNotice from 'calypso/my-sites/domains/domain-management/components/domain/info-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import DnsRecordsList from 'calypso/my-sites/domains/domain-management/dns/dns-records-list';
import EmailSetup from 'calypso/my-sites/domains/domain-management/email-setup';
import { WPCOM_DEFAULT_NAMESERVERS_REGEX } from 'calypso/my-sites/domains/domain-management/name-servers/constants';
import withDomainNameservers from 'calypso/my-sites/domains/domain-management/name-servers/with-domain-nameservers';
import {
	domainManagementEdit,
	domainManagementList,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import { fetchDns } from 'calypso/state/domains/dns/actions';
import { getDomainDns } from 'calypso/state/domains/dns/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DnsAddNewRecordButton from './dns-add-new-record-button';
import DnsDetails from './dns-details';
import DnsImportBindFileButton from './dns-import-bind-file-button';
import DnsMenuOptionsButton from './dns-menu-options-button';
import './style.scss';

class DnsRecords extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		dns: PropTypes.object.isRequired,
		showPlaceholder: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		nameservers: PropTypes.array || null,
	};

	hasDefaultCnameRecord = () => {
		const { dns, selectedDomainName } = this.props;
		return dns?.records?.some(
			( record ) =>
				record?.type === 'CNAME' &&
				record?.name === 'www' &&
				record?.data === `${ selectedDomainName }.`
		);
	};

	renderHeader = () => {
		const { domains, translate, selectedSite, currentRoute, selectedDomainName, dns } = this.props;
		const selectedDomain = domains?.find( ( domain ) => domain?.name === selectedDomainName );
		const pointsToWpcom = selectedDomain?.pointsToWpcom ?? false;

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
			{ label: translate( 'DNS records' ) },
		];

		const mobileItem = {
			// translators: %(domain)s is the domain name (e.g. example.com) to which settings page the user will return to when pressing the link
			label: translate( 'Back to %(domain)s', { args: { domain: selectedDomainName } } ),
			href: domainManagementEdit( selectedSite?.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		const optionsButton = (
			<DnsMenuOptionsButton
				key="menu-options-button"
				domain={ selectedDomain }
				dns={ dns }
				pointsToWpcom={ pointsToWpcom }
				hasDefaultCnameRecord={ this.hasDefaultCnameRecord() }
			/>
		);

		const buttons = [
			<DnsAddNewRecordButton
				key="add-new-record-button"
				site={ selectedSite?.slug }
				domain={ selectedDomainName }
			/>,
			<DnsImportBindFileButton
				key="import-bind-file-button"
				site={ selectedSite?.slug }
				domain={ selectedDomainName }
			/>,
			optionsButton,
		];

		const mobileButtons = [
			<DnsAddNewRecordButton
				key="mobile-add-new-record-button"
				site={ selectedSite?.slug }
				domain={ selectedDomainName }
				isMobile={ true }
			/>,
			<DnsImportBindFileButton
				key="import-bind-file-button"
				site={ selectedSite?.slug }
				domain={ selectedDomainName }
				isMobile={ true }
			/>,
			optionsButton,
		];

		return (
			<DomainHeader
				items={ items }
				mobileItem={ mobileItem }
				buttons={ buttons }
				mobileButtons={ mobileButtons }
			/>
		);
	};

	hasWpcomNameservers = () => {
		const { nameservers } = this.props;

		if ( ! nameservers || nameservers.length === 0 ) {
			return false;
		}

		return nameservers.every( ( nameserver ) => {
			return WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	renderNotice = () => {
		const { translate, selectedSite, currentRoute, selectedDomainName, nameservers } = this.props;

		if (
			( ! englishLocales.includes( getLocaleSlug() ) &&
				! i18n.hasTranslation(
					"Your domain is using external name servers so the DNS records you're editing won't be in effect until you switch to use WordPress.com name servers. {{a}}Update your name servers now{{/a}}."
				) ) ||
			this.hasWpcomNameservers() ||
			! nameservers ||
			! nameservers.length
		) {
			return null;
		}

		return (
			<div className="dns-records-notice">
				<Icon
					icon={ info }
					size={ 18 }
					className="dns-records-notice__icon gridicon"
					viewBox="2 2 20 20"
				/>
				<div className="dns-records-notice__message">
					{ translate(
						"Your domain is using external name servers so the DNS records you're editing won't be in effect until you switch to use WordPress.com name servers. {{a}}Update your name servers now{{/a}}.",
						{
							components: {
								a: (
									<a
										href={ domainManagementEdit(
											selectedSite.slug,
											selectedDomainName,
											currentRoute,
											{ nameservers: true }
										) }
									></a>
								),
							},
						}
					) }
				</div>
			</div>
		);
	};

	renderMain() {
		const { dns, selectedDomainName, selectedSite, translate, domains } = this.props;
		const selectedDomain = domains?.find( ( domain ) => domain?.name === selectedDomainName );
		const headerText = translate( 'DNS Records' );

		return (
			<Main wideLayout className="dns-records">
				<BodySectionCssClass bodyClass={ [ 'dns__body-white' ] } />
				<DocumentHead title={ headerText } />
				{ this.renderHeader() }
				{ selectedDomain?.canManageDnsRecords ? (
					<>
						<DnsDetails />
						{ this.renderNotice() }
						<DnsRecordsList
							dns={ dns }
							selectedSite={ selectedSite }
							selectedDomainName={ selectedDomainName }
						/>
						<EmailSetup selectedDomainName={ selectedDomainName } />
					</>
				) : (
					<InfoNotice redesigned={ false } text={ selectedDomain?.cannotManageDnsRecordsReason } />
				) }
			</Main>
		);
	}

	render() {
		const { showPlaceholder, selectedDomainName } = this.props;

		return (
			<Fragment>
				<QueryDomainDns domain={ selectedDomainName } />
				{ showPlaceholder ? (
					<DomainMainPlaceholder breadcrumbs={ this.renderHeader } />
				) : (
					this.renderMain()
				) }
			</Fragment>
		);
	}
}

export default connect(
	( state, { selectedDomainName } ) => {
		const selectedSite = getSelectedSite( state );
		const domains = getDomainsBySiteId( state, selectedSite?.ID );
		const isRequestingDomains = isRequestingSiteDomains( state, selectedSite?.ID );
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
)( localize( withDomainNameservers( DnsRecords ) ) );
