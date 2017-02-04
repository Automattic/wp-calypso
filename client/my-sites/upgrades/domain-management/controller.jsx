/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import DnsData from 'components/data/domain-management/dns' ;
import DomainManagement from './domain-management';
import DomainManagementData from 'components/data/domain-management';
import EmailData from 'components/data/domain-management/email' ;
import EmailForwardingData from 'components/data/domain-management/email-forwarding' ;
import NameserversData from 'components/data/domain-management/nameservers';
import paths from 'my-sites/upgrades/paths';
import ProductsList from 'lib/products-list';
import { renderPage } from 'lib/react-helpers';
import SiteRedirectData from 'components/data/domain-management/site-redirect';
import SitesList from 'lib/sites-list';
import TransferData from 'components/data/domain-management/transfer';
import WhoisData from 'components/data/domain-management/whois';
import { setDocumentHeadTitle } from 'state/document-head/actions';

const productsList = new ProductsList(),
	sites = new SitesList();

const setTitle = function( title, pageContext ) {
	pageContext.store.dispatch( setDocumentHeadTitle( title ) );
};

module.exports = {
	domainManagementList( pageContext ) {
		setTitle(
			i18n.translate( 'Domain Management' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementList( ':site' ),
			'Domain Management'
		);

		renderPage(
			<DomainManagementData
				component={ DomainManagement.List.default }
				context={ pageContext }
				productsList={ productsList }
			/>,
			pageContext
		);
	},

	domainManagementEdit( pageContext ) {
		setTitle(
			i18n.translate( 'Edit %(domain)s', {
				args: { domain: pageContext.params.domain }
			} ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementEdit( ':site', ':domain' ),
			'Domain Management › Edit'
		);

		renderPage(
			<DomainManagementData
				component={ DomainManagement.Edit }
				context={ pageContext }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
			/>,
			pageContext
		);
	},

	domainManagementPrimaryDomain: function( pageContext ) {
		setTitle(
			i18n.translate( 'Set Primary Domain' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementPrimaryDomain( ':site', ':domain' ),
			'Domain Management › Set Primary Domain'
		);

		renderPage(
			<DomainManagement.PrimaryDomain
				selectedDomainName={ pageContext.params.domain }
			/>,
			pageContext
		);
	},

	domainManagementContactsPrivacy( pageContext ) {
		setTitle(
			i18n.translate( 'Contacts and Privacy' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementContactsPrivacy( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy'
		);

		renderPage(
			<WhoisData
				component={ DomainManagement.ContactsPrivacy }
				context={ pageContext }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
				sites={ sites } />,
			pageContext
		);
	},

	domainManagementEditContactInfo( pageContext ) {
		setTitle(
			i18n.translate( 'Edit Contact Info' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementEditContactInfo( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Edit Contact Info'
		);

		renderPage(
			<WhoisData
				component={ DomainManagement.EditContactInfo }
				context={ pageContext }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
				sites={ sites } />,
			pageContext
		);
	},

	domainManagementEmail( pageContext ) {
		setTitle(
			i18n.translate( 'Email' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementEmail( ':site', pageContext.params.domain ? ':domain' : undefined ),
			'Domain Management › Email'
		);

		renderPage(
			<EmailData
				component={ DomainManagement.Email }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
				context={ pageContext }
			/>,
			pageContext
		);
	},

	domainManagementEmailForwarding( pageContext ) {
		setTitle(
			i18n.translate( 'Email Forwarding' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementEmailForwarding( ':site', ':domain' ),
			'Domain Management › Email › Email Forwarding'
		);

		renderPage(
			<EmailForwardingData
				component={ DomainManagement.EmailForwarding }
				selectedDomainName={ pageContext.params.domain }
			/>,
			pageContext
		);
	},

	domainManagementDns( pageContext ) {
		setTitle(
			i18n.translate( 'DNS Records' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementDns( ':site', ':domain' ),
			'Domain Management › Name Servers and DNS › DNS Records'
		);

		renderPage(
			<DnsData
				component={ DomainManagement.Dns }
				selectedDomainName={ pageContext.params.domain }
			/>,
			pageContext
		);
	},
	domainManagementNameServers( pageContext ) {
		setTitle(
			i18n.translate( 'Name Servers and DNS' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementNameServers( ':site', ':domain' ),
			'Domain Management › Name Servers and DNS'
		);

		renderPage(
			<NameserversData
				component={ DomainManagement.NameServers }
				selectedDomainName={ pageContext.params.domain }
			/>,
			pageContext
		);
	},

	domainManagementPrivacyProtection( pageContext ) {
		setTitle(
			i18n.translate( 'Privacy Protection' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementPrivacyProtection( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Privacy Protection'
		);

		renderPage(
			<WhoisData
				component={ DomainManagement.PrivacyProtection }
				context={ pageContext }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
				sites={ sites } />,
			pageContext
		);
	},

	domainManagementAddGoogleApps( pageContext ) {
		setTitle(
			i18n.translate( 'Add G Suite' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementAddGoogleApps( ':site', pageContext.params.domain ? ':domain' : undefined ),
			'Domain Management › Add Google Apps'
		);

		renderPage(
			<DomainManagementData
				component={ DomainManagement.AddGoogleApps }
				context={ pageContext }
				productsList={ productsList }
				selectedDomainName={ pageContext.params.domain }
			/>,
			pageContext
		);
	},

	domainManagementRedirectSettings( pageContext ) {
		setTitle(
			i18n.translate( 'Redirect Settings' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementRedirectSettings( ':site', ':domain' ),
			'Domain Management › Redirect Settings'
		);

		renderPage(
			<SiteRedirectData
				component={ DomainManagement.SiteRedirect }
				selectedDomainName={ pageContext.params.domain }
				sites={ sites } />,
			pageContext
		);
	},

	domainManagementIndex() {
		page.redirect( '/domains/manage' + ( sites.getSelectedSite() ? ( '/' + sites.getSelectedSite().slug ) : '' ) );
	},

	domainManagementTransfer( pageContext ) {
		setTitle(
			i18n.translate( 'Transfer Domain' ),
			pageContext
		);

		renderPage(
			<TransferData
				component={ DomainManagement.Transfer }
				selectedDomainName={ pageContext.params.domain }
				sites={ sites }
			/>,
			pageContext
		);
	},

	domainManagementTransferToOtherUser( pageContext ) {
		setTitle(
			i18n.translate( 'Transfer Domain' ),
			pageContext
		);

		renderPage(
			<TransferData
				component={ DomainManagement.TransferToOtherUser }
				selectedDomainName={ pageContext.params.domain }
				sites={ sites } />,
			pageContext
		);
	},

	domainManagementTransferOut( pageContext ) {
		setTitle(
			i18n.translate( 'Transfer Domain' ),
			pageContext
		);

		renderPage(
			<TransferData
				component={ DomainManagement.TransferOut }
				selectedDomainName={ pageContext.params.domain }
				sites={ sites } />,
			pageContext
		);
	}
};
