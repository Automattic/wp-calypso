/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import DomainManagement from '.';
import DomainManagementData from 'calypso/components/data/domain-management';
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
} from 'calypso/my-sites/domains/paths';
import {
	emailManagement,
	emailManagementAddGSuiteUsers,
	emailManagementForwarding,
} from 'calypso/my-sites/email/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { decodeURIComponentIfValid } from 'calypso/lib/url';

export default {
	domainManagementList( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementList( ':site' ) }
				analyticsTitle="Domain Management"
				component={ DomainManagement.List }
				context={ pageContext }
				needsCart
				needsContactDetails
				needsDomains
				needsPlans
				needsProductsList
			/>
		);
		next();
	},

	domainManagementListAllSites( pageContext, next ) {
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

	domainManagementEdit( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementEdit( ':site', ':domain', pageContext.canonicalPath ) }
				analyticsTitle="Domain Management > Edit"
				component={ DomainManagement.Edit }
				context={ pageContext }
				needsCart
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
				needsCart
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
				needsCart
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
				needsCart
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

	domainManagementAddGSuiteUsersRedirect( pageContext ) {
		page.redirect(
			emailManagementAddGSuiteUsers( pageContext.params.site, pageContext.params.domain )
		);
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
				component={ DomainManagement.Transfer }
				context={ pageContext }
				needsDomains
				needsDomainInfo
				needsUsers
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
				component={ DomainManagement.TransferToOtherSite }
				context={ pageContext }
				needsDomains
				needsUsers
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
				component={ DomainManagement.TransferToOtherUser }
				context={ pageContext }
				needsDomains
				needsUsers
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
				needsDomainInfo
				needsUsers
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
