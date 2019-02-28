/** @format */

/**
 * External dependencies
 */
import { includes } from 'lodash';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import DomainManagement from './domain-management';
import DomainManagementData from 'components/data/domain-management';
import {
	domainManagementContactsPrivacy,
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementEmail,
	domainManagementEmailForwarding,
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
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import GSuiteAddUsers from './gsuite/gsuite-add-users';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
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

	domainManagementPrimaryDomain: function( pageContext, next ) {
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
				analyticsTitle="Domain Management > Contacts and Privacy"
				component={ DomainManagement.ContactsPrivacy }
				context={ pageContext }
				needsDomains
				needsWhois
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
				needsWhois
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementEmail( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementEmail(
					':site',
					pageContext.params.domain ? ':domain' : undefined
				) }
				analyticsTitle="Domain Management > Email"
				component={ DomainManagement.Email }
				context={ pageContext }
				needsCart
				needsDomains
				needsGoogleApps
				needsPlans
				needsProductsList
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementEmailForwarding( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementEmailForwarding( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Email Forwarding"
				component={ DomainManagement.EmailForwarding }
				context={ pageContext }
				needsEmailForwarding
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementDns( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementDns( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Name Servers and DNS > DNS Records"
				component={ DomainManagement.Dns }
				context={ pageContext }
				needsDns
				needsDomains
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

	domainManagementAddGSuiteUsers( pageContext, next ) {
		pageContext.primary = <GSuiteAddUsers selectedDomainName={ pageContext.params.domain } />;
		next();
	},

	domainManagementRedirectSettings( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementRedirectSettings( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Redirect Settings"
				component={ DomainManagement.SiteRedirect }
				context={ pageContext }
				needsSiteRedirect
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
		const state = pageContext.store.getState();
		const siteId = getSelectedSiteId( state );
		const isAutomatedTransfer = isSiteAutomatedTransfer( state, siteId );
		if ( isAutomatedTransfer ) {
			const siteSlug = getSelectedSiteSlug( state );
			page.redirect( `/domains/manage/${ siteSlug }` );
			return;
		}

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
};
