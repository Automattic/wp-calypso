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
import analytics from 'lib/analytics';
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
	domainManagementPrimaryDomain,
	domainManagementPrivacyProtection,
	domainManagementRedirectSettings,
} from 'my-sites/domains/paths';
import SiteRedirectData from 'components/data/domain-management/site-redirect';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import TransferData from 'components/data/domain-management/transfer';
import WhoisData from 'components/data/domain-management/whois';
import { decodeURIComponentIfValid } from 'lib/url';

export default {
	domainManagementList( pageContext, next ) {
		analytics.pageView.record( domainManagementList( ':site' ), 'Domain Management' );

		pageContext.primary = (
			<DomainManagementData component={ DomainManagement.List } context={ pageContext } />
		);
		next();
	},

	domainManagementEdit( pageContext, next ) {
		analytics.pageView.record(
			domainManagementEdit( ':site', ':domain' ),
			'Domain Management › Edit'
		);

		const isTransfer = includes( pageContext.path, '/transfer/in/' );
		const component = isTransfer ? DomainManagement.TransferIn : DomainManagement.Edit;

		pageContext.primary = (
			<DomainManagementData
				component={ component }
				context={ pageContext }
				selectedDomainName={ decodeURIComponentIfValid( pageContext.params.domain ) }
			/>
		);
		next();
	},

	domainManagementPrimaryDomain: function( pageContext, next ) {
		analytics.pageView.record(
			domainManagementPrimaryDomain( ':site', ':domain' ),
			'Domain Management › Set Primary Domain'
		);

		pageContext.primary = (
			<DomainManagement.PrimaryDomain selectedDomainName={ pageContext.params.domain } />
		);
		next();
	},

	domainManagementContactsPrivacy( pageContext, next ) {
		analytics.pageView.record(
			domainManagementContactsPrivacy( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy'
		);

		pageContext.primary = (
			<WhoisData
				component={ DomainManagement.ContactsPrivacy }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementEditContactInfo( pageContext, next ) {
		analytics.pageView.record(
			domainManagementEditContactInfo( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Edit Contact Info'
		);

		pageContext.primary = (
			<WhoisData
				component={ DomainManagement.EditContactInfo }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementEmail( pageContext, next ) {
		analytics.pageView.record(
			domainManagementEmail( ':site', pageContext.params.domain ? ':domain' : undefined ),
			'Domain Management › Email'
		);

		pageContext.primary = (
			<EmailData
				component={ DomainManagement.Email }
				selectedDomainName={ pageContext.params.domain }
				context={ pageContext }
			/>
		);
		next();
	},

	domainManagementEmailForwarding( pageContext, next ) {
		analytics.pageView.record(
			domainManagementEmailForwarding( ':site', ':domain' ),
			'Domain Management › Email › Email Forwarding'
		);

		pageContext.primary = (
			<EmailForwardingData
				component={ DomainManagement.EmailForwarding }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementDns( pageContext, next ) {
		analytics.pageView.record(
			domainManagementDns( ':site', ':domain' ),
			'Domain Management › Name Servers and DNS › DNS Records'
		);

		pageContext.primary = (
			<DnsData
				component={ DomainManagement.Dns }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},
	domainManagementNameServers( pageContext, next ) {
		analytics.pageView.record(
			domainManagementNameServers( ':site', ':domain' ),
			'Domain Management › Name Servers and DNS'
		);

		pageContext.primary = (
			<NameserversData
				component={ DomainManagement.NameServers }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementPrivacyProtection( pageContext, next ) {
		analytics.pageView.record(
			domainManagementPrivacyProtection( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Privacy Protection'
		);

		pageContext.primary = (
			<WhoisData
				component={ DomainManagement.PrivacyProtection }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementAddGoogleApps( pageContext, next ) {
		analytics.pageView.record(
			domainManagementAddGoogleApps( ':site', pageContext.params.domain ? ':domain' : undefined ),
			'Domain Management › Add Google Apps'
		);

		pageContext.primary = (
			<DomainManagementData
				component={ DomainManagement.AddGoogleApps }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementRedirectSettings( pageContext, next ) {
		analytics.pageView.record(
			domainManagementRedirectSettings( ':site', ':domain' ),
			'Domain Management › Redirect Settings'
		);

		pageContext.primary = (
			<SiteRedirectData
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
				component={ DomainManagement.Transfer }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferToOtherSite( pageContext, next ) {
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
				component={ DomainManagement.TransferToOtherUser }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},

	domainManagementTransferOut( pageContext, next ) {
		pageContext.primary = (
			<TransferData
				component={ DomainManagement.TransferOut }
				selectedDomainName={ pageContext.params.domain }
			/>
		);
		next();
	},
};
