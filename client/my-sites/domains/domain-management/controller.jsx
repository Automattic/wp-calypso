/**
 * External dependencies
 */
import { includes } from 'lodash';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import DomainManagement from '.';
import DomainManagementData from 'components/data/domain-management';
import {
	domainManagementChangeSiteAddress,
	domainManagementContactsPrivacy,
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementList,
	domainManagementNameServers,
	domainManagementPrimaryDomain,
	domainManagementRedirectSettings,
	domainManagementTransfer,
	domainManagementTransferIn,
	domainManagementTransferOut,
	domainManagementTransferToAnotherUser,
	domainManagementTransferToOtherSite,
	domainManagementManageConsent,
	domainManagementDomainConnectMapping,
} from 'my-sites/domains/paths';
import {
	emailManagement,
	emailManagementAddGSuiteUsers,
	emailManagementForwarding,
} from 'my-sites/email/paths';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { decodeURIComponentIfValid } from 'lib/url';

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
		pageContext.primary = <DomainManagement.ListAll />;
		next();
	},

	domainManagementEdit( pageContext, next ) {
		const isTransfer = includes( pageContext.path, '/transfer/in/' );
		const component = isTransfer ? DomainManagement.TransferIn : DomainManagement.Edit;

		pageContext.primary = (
			<DomainManagementData
				analyticsPath={
					isTransfer
						? domainManagementTransferIn( ':site', ':domain' )
						: domainManagementEdit( ':site', ':domain' )
				}
				analyticsTitle="Domain Management > Edit"
				component={ component }
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

	domainManagementPrimaryDomain: function ( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementPrimaryDomain( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Set Primary Domain"
				component={ DomainManagement.PrimaryDomain }
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
				needsNameservers
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

	domainManagementRedirectSettings( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementRedirectSettings( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Redirect Settings"
				component={ DomainManagement.SiteRedirect }
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
				needsDomainInfo
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
				needsDomainInfo
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
