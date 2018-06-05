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
import DnsData from 'components/data/domain-management/dns';
import DomainManagement from './domain-management';
import DomainManagementData from 'components/data/domain-management';
import EmailData from 'components/data/domain-management/email';
import EmailForwardingData from 'components/data/domain-management/email-forwarding';
import NameserversData from 'components/data/domain-management/nameservers';
import {
	domainManagementAddGoogleApps,
	domainManagementContactsPrivacy,
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementEmail,
	domainManagementEmailForwarding,
	domainManagementList,
	domainManagementNameServers,
	domainManagementPrivacyProtection,
	domainManagementRedirectSettings,
	domainManagementTransfer,
	domainManagementTransferIn,
	domainManagementTransferOut,
	domainManagementTransferToAnotherUser,
	domainManagementTransferToOtherSite,
	domainManagementManageConsent,
	domainManagementDomainConnectMapping,
} from 'my-sites/domains/paths';
import ProductsList from 'lib/products-list';
import SiteRedirectData from 'components/data/domain-management/site-redirect';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import TransferData from 'components/data/domain-management/transfer';
import WhoisData from 'components/data/domain-management/whois';
import { decodeURIComponentIfValid } from 'lib/url';
import { domainManagementPrimaryDomain } from '../paths';

const productsList = new ProductsList();

export default {
	domainManagementList( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementList( ':site' ) }
				analyticsTitle="Domain Management"
				component={ DomainManagement.List }
				context={ pageContext }
				productsList={ productsList }
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
				productsList={ productsList }
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
				productsList={ productsList }
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementContactsPrivacy( pageContext, next ) {
		pageContext.primary = (
			<WhoisData
				analyticsPath={ domainManagementContactsPrivacy( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Contacts and Privacy"
				component={ DomainManagement.ContactsPrivacy }
				context={ pageContext }
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
				productsList={ productsList }
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementEditContactInfo( pageContext, next ) {
		pageContext.primary = (
			<WhoisData
				analyticsPath={ domainManagementEditContactInfo( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Contacts and Privacy > Edit Contact Info"
				component={ DomainManagement.EditContactInfo }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementEmail( pageContext, next ) {
		pageContext.primary = (
			<EmailData
				analyticsPath={ domainManagementEmail(
					':site',
					pageContext.params.domain ? ':domain' : undefined
				) }
				analyticsTitle="Domain Management > Email"
				component={ DomainManagement.Email }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
				context={ pageContext }
			/>
		);
		next();
	},

	domainManagementEmailForwarding( pageContext, next ) {
		pageContext.primary = (
			<EmailForwardingData
				analyticsPath={ domainManagementEmailForwarding( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Email Forwarding"
				component={ DomainManagement.EmailForwarding }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementDns( pageContext, next ) {
		pageContext.primary = (
			<DnsData
				analyticsPath={ domainManagementDns( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Name Servers and DNS > DNS Records"
				component={ DomainManagement.Dns }
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
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
				productsList={ productsList }
			/>
		);
		next();
	},

	domainManagementNameServers( pageContext, next ) {
		pageContext.primary = (
			<NameserversData
				analyticsPath={ domainManagementNameServers( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Name Servers and DNS"
				component={ DomainManagement.NameServers }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementPrivacyProtection( pageContext, next ) {
		pageContext.primary = (
			<WhoisData
				analyticsPath={ domainManagementPrivacyProtection( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Contacts and Privacy > Privacy Protection"
				component={ DomainManagement.PrivacyProtection }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementAddGoogleApps( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath={ domainManagementAddGoogleApps(
					':site',
					pageContext.params.domain ? ':domain' : undefined
				) }
				analyticsTitle="Domain Management > Add Google Apps"
				component={ DomainManagement.AddGoogleApps }
				context={ pageContext }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementRedirectSettings( pageContext, next ) {
		pageContext.primary = (
			<SiteRedirectData
				analyticsPath={ domainManagementRedirectSettings( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Redirect Settings"
				component={ DomainManagement.SiteRedirect }
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
			<TransferData
				analyticsPath={ domainManagementTransfer( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer"
				component={ DomainManagement.Transfer }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferToOtherSite( pageContext, next ) {
		pageContext.primary = (
			<TransferData
				analyticsPath={ domainManagementTransferToOtherSite( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Other Site"
				component={ DomainManagement.TransferToOtherSite }
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
			<TransferData
				analyticsPath={ domainManagementTransferToAnotherUser( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Other User"
				component={ DomainManagement.TransferToOtherUser }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferOut( pageContext, next ) {
		pageContext.primary = (
			<TransferData
				analyticsPath={ domainManagementTransferOut( ':site', ':domain' ) }
				analyticsTitle="Domain Management > Transfer To Another Registrar"
				component={ DomainManagement.TransferOut }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},
};
