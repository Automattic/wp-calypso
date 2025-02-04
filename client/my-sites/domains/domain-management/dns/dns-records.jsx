import { recordTracksEvent } from '@automattic/calypso-analytics';
import { englishLocales } from '@automattic/i18n-utils';
import { Icon, info } from '@wordpress/icons';
import i18n, { getLocaleSlug, localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryDomainDns from 'calypso/components/data/query-domain-dns';
import { modeType, stepSlug } from 'calypso/components/domains/connect-domain-step/constants';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { isSubdomain } from 'calypso/lib/domains';
import { type as domainTypes } from 'calypso/lib/domains/constants';
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
	domainMappingSetup,
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
		titleOverride: PropTypes.string,
		subtitleOverride: PropTypes.string,
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

	hasDefaultARecords = () => {
		const { dns } = this.props;
		return dns?.records?.some( ( record ) => record?.type === 'A' && record?.protected_field );
	};

	hasDefaultEmailRecords = () => {
		const { dns, selectedDomainName } = this.props;

		const hasDefaultDkim1Record = dns?.records?.some(
			( record ) =>
				record.type === 'CNAME' &&
				record.name === `wpcloud1._domainkey` &&
				record.data === 'wpcloud1._domainkey.wpcloud.com.'
		);
		const hasDefaultDkim2Record = dns?.records?.some(
			( record ) =>
				record?.type === 'CNAME' &&
				record.name === `wpcloud2._domainkey` &&
				record.data === 'wpcloud2._domainkey.wpcloud.com.'
		);
		const hasDefaultDmarcRecord = dns?.records?.some(
			( record ) =>
				record.type === 'TXT' && record.name === `_dmarc` && record.data?.startsWith( 'v=DMARC1' )
		);
		const hasDefaultSpfRecord = dns?.records?.some(
			( record ) =>
				record.type === 'TXT' &&
				record.name === `${ selectedDomainName }.` &&
				record.data?.startsWith( 'v=spf1' ) &&
				record.data?.match( /\binclude:_spf.wpcloud.com\b/ )
		);

		return (
			hasDefaultDkim1Record && hasDefaultDkim2Record && hasDefaultDmarcRecord && hasDefaultSpfRecord
		);
	};

	renderHeader = () => {
		const { domains, translate, selectedSite, currentRoute, selectedDomainName, dns } = this.props;
		const {
			showBreadcrumb = true,
			titleOverride,
			subtitleOverride,
		} = this.props.context?.params || {};
		const selectedDomain = domains?.find( ( domain ) => domain?.name === selectedDomainName );

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
				hasDefaultARecords={ this.hasDefaultARecords() }
				hasDefaultCnameRecord={ this.hasDefaultCnameRecord() }
				hasDefaultEmailRecords={ this.hasDefaultEmailRecords() }
			/>
		);

		const buttons = [
			<DnsImportBindFileButton
				key="import-bind-file-button"
				site={ selectedSite?.slug }
				domain={ selectedDomainName }
			/>,
			<DnsAddNewRecordButton
				key="add-new-record-button"
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
				isMobile
			/>,
			<DnsImportBindFileButton
				key="import-bind-file-button"
				site={ selectedSite?.slug }
				domain={ selectedDomainName }
				isMobile
			/>,
			optionsButton,
		];

		return (
			<DomainHeader
				items={ showBreadcrumb ? items : [] }
				mobileItem={ showBreadcrumb ? mobileItem : null }
				buttons={ buttons }
				mobileButtons={ mobileButtons }
				titleOverride={ titleOverride }
				subtitleOverride={ subtitleOverride }
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

	renderDefaultARecordsNotice = () => {
		const { translate } = this.props;

		if ( ! this.hasWpcomNameservers() ) {
			return null;
		}

		if ( this.hasDefaultARecords() ) {
			return null;
		}

		recordTracksEvent( 'calypso_domain_management_dns_default_a_records_notice_show', {
			domain_name: this.props.selectedDomainName,
		} );

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
						'Your domain is not using default A records. This means it may not be pointing to your WordPress.com site correctly. To restore default A records, click on the three dots menu and select "Restore default A records". {{defaultRecordsLink}}Learn more{{/defaultRecordsLink}}.',
						{
							components: {
								defaultRecordsLink: (
									<InlineSupportLink supportContext="dns_default_records" showIcon={ false } />
								),
							},
						}
					) }
				</div>
			</div>
		);
	};

	renderDefaultCNameRecordNotice = () => {
		const { translate } = this.props;

		if ( ! this.hasWpcomNameservers() ) {
			return null;
		}

		if ( this.hasDefaultCnameRecord() ) {
			return null;
		}

		recordTracksEvent( 'calypso_domain_management_dns_default_cname_record_notice_show', {
			domain_name: this.props.selectedDomainName,
		} );

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
						'Your domain is not using the default WWW CNAME record. This means your WordPress.com site may not be reached correctly using the www prefix. To restore the default WWW CNAME record, click on the three dots menu and select "Restore default CNAME record". {{defaultRecordsLink}}Learn more{{/defaultRecordsLink}}.',
						{
							components: {
								defaultRecordsLink: (
									<InlineSupportLink supportContext="dns_default_records" showIcon={ false } />
								),
							},
						}
					) }
				</div>
			</div>
		);
	};

	renderExternalNameserversNotice = () => {
		const { translate, selectedSite, currentRoute, selectedDomainName, nameservers, domains } =
			this.props;

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

		const selectedDomain = domains?.find( ( domain ) => domain?.name === selectedDomainName );

		let mappingSetupStep =
			selectedDomain.connectionMode === modeType.ADVANCED
				? stepSlug.ADVANCED_UPDATE
				: stepSlug.SUGGESTED_UPDATE;
		if ( isSubdomain( selectedDomainName ) ) {
			mappingSetupStep =
				selectedDomain.connectionMode === modeType.ADVANCED
					? stepSlug.SUBDOMAIN_ADVANCED_UPDATE
					: stepSlug.SUBDOMAIN_SUGGESTED_UPDATE;
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
										href={
											selectedDomain.type === domainTypes.MAPPED
												? domainMappingSetup(
														selectedSite.slug,
														selectedDomainName,
														mappingSetupStep
												  )
												: domainManagementEdit(
														selectedSite.slug,
														selectedDomainName,
														currentRoute,
														{ nameservers: true }
												  )
										}
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
		const { showDetails = true } = this.props.context?.params || {};
		const selectedDomain = domains?.find( ( domain ) => domain?.name === selectedDomainName );
		const headerText = translate( 'DNS Records' );

		return (
			<Main wideLayout className="dns-records">
				<BodySectionCssClass bodyClass={ [ 'dns__body-white' ] } />
				<DocumentHead title={ headerText } />
				{ this.renderHeader() }
				{ selectedDomain?.canManageDnsRecords ? (
					<>
						{ showDetails && <DnsDetails /> }
						{ this.renderExternalNameserversNotice() }
						{ this.renderDefaultARecordsNotice() }
						{ this.renderDefaultCNameRecordNotice() }
						<DnsRecordsList
							dns={ dns }
							selectedSite={ selectedSite }
							selectedDomain={ selectedDomain }
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
