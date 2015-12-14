/**
 * External Dependencies
 */
import page from 'page';
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'analytics';
import DnsData from 'components/data/domain-management/dns' ;
import DomainManagement from './domain-management';
import DomainManagementData from 'components/data/domain-management';
import EmailData from 'components/data/domain-management/email' ;
import EmailForwardingData from 'components/data/domain-management/email-forwarding' ;
import i18n from 'lib/mixins/i18n';
import NameserversData from 'components/data/domain-management/nameservers';
import paths from 'my-sites/upgrades/paths';
import PrimaryDomainData from 'components/data/domain-management/primary-domain';
import ProductsList from 'lib/products-list';
import SiteRedirectData from 'components/data/domain-management/site-redirect';
import SitesList from 'lib/sites-list';
import TransferData from 'components/data/domain-management/transfer';
import WhoisData from 'components/data/domain-management/whois';
import titleActions from 'lib/screen-title/actions';

const productsList = new ProductsList(),
	sites = new SitesList();

const renderPage = function( component ) {
	ReactDom.render(
		component,
		document.getElementById( 'primary' )
	);
};

const setTitle = function( title, context ) {
	titleActions.setTitle(
		title,
		{ siteID: context.params.site }
	);
};

module.exports = {
	domainManagementList( context ) {
		setTitle(
			i18n.translate( 'Domain Management' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementList( ':site' ),
			'Domain Management'
		);

		renderPage(
			<DomainManagementData
				component={ DomainManagement.List }
				context={ context }
				productsList={ productsList }
				sites={ sites } />
		);
	},

	domainManagementEdit( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Edit' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementEdit( ':site', ':domain' ),
			'Domain Management › Edit'
		);

		renderPage(
			<DomainManagementData
				component={ DomainManagement.Edit }
				context={ context }
				productsList={ productsList }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementPrimaryDomain: function( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Set Primary Domain' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementPrimaryDomain( ':site', ':domain' ),
			'Domain Management › Set Primary Domain'
		);

		renderPage(
			<PrimaryDomainData
				component={ DomainManagement.PrimaryDomain }
				context={ context }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementContactsPrivacy( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Contacts and Privacy' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementContactsPrivacy( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy'
		);

		renderPage(
			<WhoisData
				component={ DomainManagement.ContactsPrivacy }
				context={ context }
				productsList={ productsList }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementEditContactInfo( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Contacts and Privacy › Edit Contact Info' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementEditContactInfo( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Edit Contact Info'
		);

		renderPage(
			<WhoisData
				component={ DomainManagement.EditContactInfo }
				context={ context }
				productsList={ productsList }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementEmail( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Email' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementEmail( ':site', context.params.domain ? ':domain' : undefined ),
			'Domain Management › Email'
		);

		renderPage(
			<EmailData
				component={ DomainManagement.Email }
				productsList={ productsList }
				selectedDomainName={ context.params.domain }
				context={ context }
				sites={ sites } />
		);
	},

	domainManagementEmailForwarding( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Email › Email Forwarding' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementEmailForwarding( ':site', ':domain' ),
			'Domain Management › Email › Email Forwarding'
		);

		renderPage(
			<EmailForwardingData
				component={ DomainManagement.EmailForwarding }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementDns( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Name Servers and DNS › DNS Records' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementDns( ':site', ':domain' ),
			'Domain Management › Name Servers and DNS › DNS Records'
		);

		renderPage(
			<DnsData
				component={ DomainManagement.Dns }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},
	domainManagementNameServers( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Name Servers and DNS' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementNameServers( ':site', ':domain' ),
			'Domain Management › Name Servers and DNS'
		);

		renderPage(
			<NameserversData
				component={ DomainManagement.NameServers }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementPrivacyProtection( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Contacts and Privacy › Privacy Protection' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementPrivacyProtection( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Privacy Protection'
		);

		renderPage(
			<WhoisData
				component={ DomainManagement.PrivacyProtection }
				context={ context }
				productsList={ productsList }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementAddGoogleApps( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Add Google Apps' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementAddGoogleApps( ':site', context.params.domain ? ':domain' : undefined ),
			'Domain Management › Add Google Apps'
		);

		renderPage(
			<DomainManagementData
				component={ DomainManagement.AddGoogleApps }
				context={ context }
				productsList={ productsList }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementRedirectSettings( context ) {
		setTitle(
			i18n.translate( 'Domain Management › Redirect Settings' ),
			context
		);

		analytics.pageView.record(
			paths.domainManagementRedirectSettings( ':site', ':domain' ),
			'Domain Management › Redirect Settings'
		);

		renderPage(
			<SiteRedirectData
				component={ DomainManagement.SiteRedirect }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	},

	domainManagementIndex() {
		page.redirect( '/domains/manage' + ( sites.getSelectedSite() ? ( '/' + sites.getSelectedSite().slug ) : '' ) );
	},

	domainManagementTransfer( context ) {
		setTitle(
			i18n.translate( 'Domain Management' ) + ' › ' + i18n.translate( 'Transfer Domain' ),
			context
		);

		renderPage(
			<TransferData
				component={ DomainManagement.Transfer }
				selectedDomainName={ context.params.domain }
				sites={ sites } />
		);
	}
};
