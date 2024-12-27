import page from '@automattic/calypso-router';
import { isFreeUrlDomainName } from '@automattic/domains-table/src/utils/is-free-url-domain-name';
import DomainManagementData from 'calypso/components/data/domain-management';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import SubpageWrapper from 'calypso/my-sites/domains/domain-management/subpage-wrapper';
import {
	domainManagementAllEditSelectedContactInfo,
	domainManagementEditSelectedContactInfo,
	domainManagementDns,
	domainManagementDnsAddRecord,
	domainManagementDnsEditRecord,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementList,
	domainManagementRedirectSettings,
	domainManagementSecurity,
	domainManagementSiteRedirect,
	domainManagementTransfer,
	domainManagementTransferIn,
	domainManagementTransferOut,
	domainManagementTransferToAnotherUser,
	domainManagementTransferToAnyUser,
	domainManagementTransferToOtherSite,
	domainManagementManageConsent,
	domainManagementDomainConnectMapping,
	domainManagementRoot,
} from 'calypso/my-sites/domains/paths';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getSubpageParams } from './subpage-wrapper/subpages';
import DomainManagement from '.';

export default {
	domainManagementList( pageContext, next ) {
		pageContext.primary = (
			<DomainManagement.BulkSiteDomains
				analyticsPath={ domainManagementRoot( ':site' ) }
				analyticsTitle="Domain Management"
			/>
		);
		next();
	},

	domainManagementListAllSites( pageContext, next ) {
		pageContext.primary = (
			<DomainManagement.BulkAllDomains
				analyticsPath={ domainManagementRoot() }
				analyticsTitle="Domain Management > All Domains"
			/>
		);
		next();
	},

	domainManagementEdit( pageContext, next ) {
		const selectedDomainName = decodeURIComponentIfValid( pageContext.params.domain );
		if ( isFreeUrlDomainName( selectedDomainName ) ) {
			const state = pageContext.store.getState();
			const siteSlug = getSelectedSiteSlug( state );
			page.redirect( domainManagementList( siteSlug ) );
		}

		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementEdit( ':site', ':domain', pageContext.canonicalPath ) }
				analyticsTitle="Domain Management > Edit"
				component={ DomainManagement.Settings }
				context={ pageContext }
				needsDomains
				needsPlans
				needsProductsList
				selectedDomainName={ selectedDomainName }
			/>
		);
		next();
	},

	domainManagementSiteRedirect( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementSiteRedirect( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Edit"
				component={ DomainManagement.Settings }
				context={ pageContext }
				needsDomains
				needsPlans
				needsProductsList
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementTransferIn( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransferIn( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Edit"
				component={ DomainManagement.Settings }
				context={ pageContext }
				needsDomains
				needsPlans
				needsProductsList
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementManageConsent( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementManageConsent( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Contacts and Privacy > Manage Consent for Personal Data Use"
				component={ DomainManagement.ManageConsent }
				context={ pageContext }
				needsDomains
				needsPlans
				needsProductsList
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementEditContactInfo( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementEditContactInfo( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Contacts and Privacy > Edit Contact Info"
				component={ DomainManagement.EditContactInfoPage }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementAllEditSelectedContactInfo( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementAllEditSelectedContactInfo() }
				analyticsTitle="Domain Management > Edit Selected Contact Info"
				component={ DomainManagement.BulkEditContactInfoPage }
				context={ pageContext }
				needsDomains
			/>
		);
		next();
	},

	domainManagementEditSelectedContactInfo( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementEditSelectedContactInfo( ':site' ) }
				analyticsTitle="Domain Management > Edit Selected Contact Info"
				component={ DomainManagement.BulkEditContactInfoPage }
				context={ pageContext }
				needsDomains
			/>
		);
		next();
	},

	domainManagementEmailRedirect( pageContext ) {
		page.redirect( getEmailManagementPath( pageContext.params.site, pageContext.params.domain ) );
	},

	domainManagementDns( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementDns( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Name Servers and DNS > DNS Records"
				component={ DomainManagement.DnsRecords }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
				needsDomains
			/>
		);
		next();
	},

	domainManagementDnsAddRecord( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementDnsAddRecord( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Name Servers and DNS > DNS Records > Add a record"
				component={ DomainManagement.AddDnsRecord }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
				needsDomains
			/>
		);
		next();
	},

	domainManagementDnsEditRecord( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementDnsEditRecord( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Name Servers and DNS > DNS Records > Edit record"
				component={ DomainManagement.AddDnsRecord }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementDomainConnectMapping( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementDomainConnectMapping( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Set Up Your Domain"
				component={ DomainManagement.DomainConnectMapping }
				context={ pageContext }
				needsDomains
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementSecurity( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementSecurity( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Security"
				component={ DomainManagement.Security }
				context={ pageContext }
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
				needsDomains
			/>
		);
		next();
	},

	domainManagementRedirectSettings( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementRedirectSettings( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Redirect Settings"
				component={ DomainManagement.SiteRedirectSettings }
				context={ pageContext }
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementIndex( pageContext ) {
		const state = pageContext.store.getState();
		const siteSlug = getSelectedSiteSlug( state );

		page.redirect( '/domains/manage' + ( siteSlug ? `/${ siteSlug }` : '' ) );
	},

	domainManagementTransfer( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransfer( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer"
				component={ DomainManagement.TransferPage }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferToOtherSite( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransferToOtherSite( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Other Site"
				component={ DomainManagement.TransferDomainToOtherSite }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferToOtherUser( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransferToAnotherUser( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Other User"
				component={ DomainManagement.TransferDomainToOtherUser }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferToAnyUser( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransferToAnyUser( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Another User"
				component={ DomainManagement.TransferDomainToAnyUser }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferOut( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransferOut( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Another Registrar"
				component={ DomainManagement.TransferOut }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	// The main layout that wraps all the domain management pages.
	domainDashboardLayout( pageContext, next ) {
		const selectedDomainName = decodeURIComponentIfValid( pageContext.params.domain );
		const selectedFeature = pageContext.primary?.props?.selectedFeature;

		pageContext.primary = (
			<DomainManagement.DomainDashboardLayout
				innerContent={ pageContext.primary }
				selectedDomainName={ selectedDomainName }
				selectedFeature={ selectedFeature }
			/>
		);

		next();
	},

	// The domain overview page. For the All Domains view.
	domainManagementV2( pageContext, next ) {
		const selectedDomainName = decodeURIComponentIfValid( pageContext.params.domain );

		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementRoot( ':domain' ) }
				analyticsTitle="Domain Management"
				component={ DomainManagement.Settings }
				context={ pageContext }
				selectedDomainName={ selectedDomainName }
				needsDomains
			/>
		);
		next();
	},

	// The domain overview pane. Has a tabbed layout with the domain overview and email management.
	domainManagementPaneView( feature ) {
		return ( pageContext, next ) => {
			const state = pageContext.store.getState();
			const siteSlug = getSelectedSiteSlug( state );
			const site = getSite( state, siteSlug );
			const selectedDomainName = decodeURIComponentIfValid( pageContext.params.domain );

			pageContext.primary = (
				<DomainManagement.DomainOverviewPane
					selectedDomainPreview={ pageContext.primary }
					selectedDomain={ selectedDomainName }
					selectedFeature={ feature }
					siteSlug={ siteSlug }
					site={ site }
				/>
			);

			next();
		};
	},

	domainManagementSubpageParams( subPageKey ) {
		return ( pageContext, next ) => {
			pageContext.params = {
				...pageContext.params,
				...getSubpageParams( subPageKey ),
				subPageKey,
			};
			next();
		};
	},

	domainManagementSubpageView( pageContext, next ) {
		pageContext.primary = (
			<SubpageWrapper
				subpageKey={ pageContext.params.subPageKey }
				siteName={ pageContext.params.site }
				domainName={ pageContext.params.domain }
			>
				{ pageContext.primary }
			</SubpageWrapper>
		);
		next();
	},
};
