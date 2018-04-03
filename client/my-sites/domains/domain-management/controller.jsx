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
import ProductsList from 'lib/products-list';
import SiteRedirectData from 'components/data/domain-management/site-redirect';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import TransferData from 'components/data/domain-management/transfer';
import WhoisData from 'components/data/domain-management/whois';
import { decodeURIComponentIfValid } from 'lib/url';

const productsList = new ProductsList();

export default {
	domainManagementList( pageContext, next ) {
		pageContext.primary = (
			<DomainManagementData
				analyticsPath="/domains/manage/:site"
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
						? '/domains/manage/:domain/transfer/in/:site'
						: '/domains/manage/:domain/edit/:site'
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
			<DomainManagement.PrimaryDomain selectedDomainName={ pageContext.params.domain } />
		);
		next();
	},

	domainManagementContactsPrivacy( pageContext, next ) {
		pageContext.primary = (
			<WhoisData
				analyticsPath="/domains/manage/:domain/contacts-privacy/:site"
				analyticsTitle="Domain Management > Contacts and Privacy"
				component={ DomainManagement.ContactsPrivacy }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementEditContactInfo( pageContext, next ) {
		pageContext.primary = (
			<WhoisData
				analyticsPath="/domains/manage/:domain/edit-contact-info/:site"
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
				analyticsPath={
					pageContext.params.domain
						? '/domains/manage/:domain/email/:site'
						: '/domains/manage/email/:site'
				}
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
				analyticsPath="/domains/manage/:domain/email-forwarding/:site"
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
				analyticsPath="/domains/manage/:domain/dns/:site"
				analyticsTitle="Domain Management > Name Servers and DNS > DNS Records"
				component={ DomainManagement.Dns }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},
	domainManagementNameServers( pageContext, next ) {
		pageContext.primary = (
			<NameserversData
				analyticsPath="/domains/manage/:domain/name-servers/:site"
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
				analyticsPath="/domains/manage/:domain/privacy-protection/:site"
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
				analyticsPath={
					pageContext.params.domain
						? '/domains/manage/:domain/add-google-apps/:site'
						: '/domains/manage/add-google-apps/:site'
				}
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
				analyticsPath="/domains/manage/:domain/redirect-settings/:site"
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
				analyticsPath="/domains/manage/:domain/transfer/:site"
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
				analyticsPath="/domains/manage/:domain/transfer/other-site/:site"
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
				analyticsPath="/domains/manage/:domain/transfer/other-user/:site"
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
				analyticsPath="/domains/manage/:domain/transfer/out/:site"
				analyticsTitle="Domain Management > Transfer To Another Registrar"
				component={ DomainManagement.TransferOut }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},
};
