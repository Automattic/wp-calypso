import config from '@automattic/calypso-config';
import page from 'page';
import DomainManagementData from 'calypso/components/data/domain-management';
import { decodeURIComponentIfValid } from 'calypso/lib/url';
import {
	domainManagementChangeSiteAddress,
	domainManagementContactsPrivacy,
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementList,
	domainManagementNameServers,
	domainManagementRedirectSettings,
	domainManagementSecurity,
	domainManagementSiteRedirect,
	domainManagementTransfer,
	domainManagementTransferIn,
	domainManagementTransferOut,
	domainManagementTransferToAnotherUser,
	domainManagementTransferToOtherSite,
	domainManagementManageConsent,
	domainManagementDomainConnectMapping,
	domainManagementRoot,
	domainManagementAllEditContactInfo,
} from 'calypso/my-sites/domains/paths';
import { emailManagement, emailManagementForwarding } from 'calypso/my-sites/email/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import DomainManagement from '.';

export default {
	domainManagementList( pageContext, next ) {
		let listComponent = DomainManagement.List;
		if ( config.isEnabled( 'domains/management-list-redesign' ) ) {
			listComponent = DomainManagement.SiteDomains;
		}
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementList( ':site' ) }
				analyticsTitle="Domain Management"
				component={ listComponent }
				context={ pageContext }
				needsContactDetails
				needsDomains
				needsPlans
				needsProductsList
			/>
		);
		next();
	},

	domainManagementListAllSites( pageContext, next ) {
		if ( config.isEnabled( 'domains/management-list-redesign' ) ) {
			// TODO: set different component for the new domain list
		}
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementRoot() }
				analyticsTitle="Domain Management > All Domains"
				component={ DomainManagement.ListAll }
				context={ pageContext }
			/>
		);
		next();
	},

	domainManagementBulkEditContactInfo( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementAllEditContactInfo() }
				analyticsTitle="Domain Management > All Domains > Edit Contact Info"
				component={ DomainManagement.BulkEditContactInfo }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementEdit( pageContext, next ) {
		if ( config.isEnabled( 'domains/settings-page-redesign' ) ) {
			// TODO: set different component for the new domain settings page
		}
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementEdit( ':site', ':domain', pageContext.canonicalPath ) }
				analyticsTitle="Domain Management > Edit"
				component={ DomainManagement.Edit }
				context={ pageContext }
				needsContactDetails
				needsDomains
				needsPlans
				needsProductsList
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementSiteRedirect( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementSiteRedirect( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Edit"
				component={ DomainManagement.SiteRedirect }
				context={ pageContext }
				needsContactDetails
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
				component={ DomainManagement.TransferIn }
				context={ pageContext }
				needsContactDetails
				needsDomains
				needsPlans
				needsProductsList
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementContactsPrivacy( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementContactsPrivacy( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Contacts"
				component={ DomainManagement.ContactsPrivacy }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
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
				needsContactDetails
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
				component={ DomainManagement.EditContactInfo }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementEmailRedirect( pageContext ) {
		page.redirect( emailManagement( pageContext.params.site, pageContext.params.domain ) );
	},

	domainManagementEmailForwardingRedirect( pageContext ) {
		page.redirect(
			emailManagementForwarding( pageContext.params.site, pageContext.params.domain )
		);
	},

	domainManagementDns( pageContext, next ) {
		if ( config.isEnabled( 'domains/dns-records-redesign' ) ) {
			// TODO: set different component for the new dns records list (and there'll be a separate page for the add/edit form)
			pageContext.primary = (
				<DomainManagementData
					analyticsPath={ domainManagementDns( ':site', ':domain' ) }
					analyticsTitle="Domain Management > Name Servers and DNS > DNS Records"
					component={ DomainManagement.DnsRecords }
					context={ pageContext }
					selectedDomainName={ pageContext.params.domain }
				/>
			);
			next();
		}

		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementDns( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Name Servers and DNS > DNS Records"
				component={ DomainManagement.Dns }
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

	domainManagementNameServers( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementNameServers( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Name Servers and DNS"
				component={ DomainManagement.NameServers }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
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
		if ( config.isEnabled( 'domains/transfers-redesign' ) ) {
			// TODO: set different component for the new transfer page
		}
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransfer( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer"
				component={ DomainManagement.Transfer }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferToOtherSite( pageContext, next ) {
		if ( config.isEnabled( 'domains/transfers-redesign' ) ) {
			// TODO: set different component for the new transfer page
		}
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransferToOtherSite( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Other Site"
				component={ DomainManagement.TransferToOtherSite }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferToOtherUser( pageContext, next ) {
		if ( config.isEnabled( 'domains/transfers-redesign' ) ) {
			// TODO: set different component for the new transfer page
		}
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementTransferToAnotherUser( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Other User"
				component={ DomainManagement.TransferToOtherUser }
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

	domainManagementChangeSiteAddress( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementChangeSiteAddress( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Change Site Address"
				component={ DomainManagement.ChangeSiteAddress }
				context={ pageContext }
				needsDomains
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},
};
