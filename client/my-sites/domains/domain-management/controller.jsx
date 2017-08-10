/** @format */
/**
 * External Dependencies
 */
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
import paths from 'my-sites/domains/paths';
import ProductsList from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import SiteRedirectData from 'components/data/domain-management/site-redirect';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import TransferData from 'components/data/domain-management/transfer';
import WhoisData from 'components/data/domain-management/whois';

const productsList = new ProductsList();

export default {
	domainManagementList( pageContext ) {
		analytics.pageView.record( paths.domainManagementList( ':site' ), 'Domain Management' );

		renderWithReduxStore(
			<DomainManagementData
				component={ DomainManagement.List }
				context={ pageContext }
				productsList={ productsList }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementEdit( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementEdit( ':site', ':domain' ),
			'Domain Management › Edit'
		);

		renderWithReduxStore(
			<DomainManagementData
				component={ DomainManagement.Edit }
				context={ pageContext }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementPrimaryDomain: function( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementPrimaryDomain( ':site', ':domain' ),
			'Domain Management › Set Primary Domain'
		);

		renderWithReduxStore(
			<DomainManagement.PrimaryDomain selectedDomainName={ pageContext.params.domain } />,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementContactsPrivacy( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementContactsPrivacy( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy'
		);

		renderWithReduxStore(
			<WhoisData
				component={ DomainManagement.ContactsPrivacy }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementEditContactInfo( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementEditContactInfo( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Edit Contact Info'
		);

		renderWithReduxStore(
			<WhoisData
				component={ DomainManagement.EditContactInfo }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementEmail( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementEmail( ':site', pageContext.params.domain ? ':domain' : undefined ),
			'Domain Management › Email'
		);

		renderWithReduxStore(
			<EmailData
				component={ DomainManagement.Email }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
				context={ pageContext }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementEmailForwarding( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementEmailForwarding( ':site', ':domain' ),
			'Domain Management › Email › Email Forwarding'
		);

		renderWithReduxStore(
			<EmailForwardingData
				component={ DomainManagement.EmailForwarding }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementDns( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementDns( ':site', ':domain' ),
			'Domain Management › Name Servers and DNS › DNS Records'
		);

		renderWithReduxStore(
			<DnsData
				component={ DomainManagement.Dns }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},
	domainManagementNameServers( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementNameServers( ':site', ':domain' ),
			'Domain Management › Name Servers and DNS'
		);

		renderWithReduxStore(
			<NameserversData
				component={ DomainManagement.NameServers }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementPrivacyProtection( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementPrivacyProtection( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Privacy Protection'
		);

		renderWithReduxStore(
			<WhoisData
				component={ DomainManagement.PrivacyProtection }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementAddGoogleApps( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementAddGoogleApps(
				':site',
				pageContext.params.domain ? ':domain' : undefined
			),
			'Domain Management › Add Google Apps'
		);

		renderWithReduxStore(
			<DomainManagementData
				component={ DomainManagement.AddGoogleApps }
				context={ pageContext }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementRedirectSettings( pageContext ) {
		analytics.pageView.record(
			paths.domainManagementRedirectSettings( ':site', ':domain' ),
			'Domain Management › Redirect Settings'
		);

		renderWithReduxStore(
			<SiteRedirectData
				component={ DomainManagement.SiteRedirect }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementIndex( pageContext ) {
		const state = pageContext.store.getState();
		const siteSlug = getSelectedSiteSlug( state );

		page.redirect( '/domains/manage' + ( siteSlug ? `/${ siteSlug }` : '' ) );
	},

	domainManagementTransfer( pageContext ) {
		renderWithReduxStore(
			<TransferData
				component={ DomainManagement.Transfer }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementTransferToOtherSite( pageContext ) {
		const state = pageContext.store.getState();
		const siteId = getSelectedSiteId( state );
		const isAutomatedTransfer = isSiteAutomatedTransfer( state, siteId );
		if ( isAutomatedTransfer ) {
			const siteSlug = getSelectedSiteSlug( state );
			page.redirect( `/domains/manage/${ siteSlug }` );
			return;
		}

		renderWithReduxStore(
			<TransferData
				component={ DomainManagement.TransferToOtherSite }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementTransferToOtherUser( pageContext ) {
		const state = pageContext.store.getState();
		const siteId = getSelectedSiteId( state );
		const isAutomatedTransfer = isSiteAutomatedTransfer( state, siteId );
		if ( isAutomatedTransfer ) {
			const siteSlug = getSelectedSiteSlug( state );
			page.redirect( `/domains/manage/${ siteSlug }` );
			return;
		}

		renderWithReduxStore(
			<TransferData
				component={ DomainManagement.TransferToOtherUser }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementTransferOut( pageContext ) {
		renderWithReduxStore(
			<TransferData
				component={ DomainManagement.TransferOut }
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},
};
