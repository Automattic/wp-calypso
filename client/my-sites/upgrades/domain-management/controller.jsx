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
import QueryWhois from 'components/data/query-whois';
import EmailData from 'components/data/domain-management/email' ;
import EmailForwardingData from 'components/data/domain-management/email-forwarding' ;
import NameserversData from 'components/data/domain-management/nameservers';
import paths from 'my-sites/upgrades/paths';
import ProductsList from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import SiteRedirectData from 'components/data/domain-management/site-redirect';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import TransferData from 'components/data/domain-management/transfer';
import WhoisData from 'components/data/domain-management/whois';
import { setDocumentHeadTitle } from 'state/document-head/actions';

const productsList = new ProductsList();

const setTitle = function( title, pageContext ) {
	pageContext.store.dispatch( setDocumentHeadTitle( title ) );
};

export default {
	domainManagementList( pageContext ) {
		setTitle(
			i18n.translate( 'Domain Management' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementList( ':site' ),
			'Domain Management'
		);

		renderWithReduxStore(
			<QueryWhois
				domain={ 'example.com' }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
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
		setTitle(
			i18n.translate( 'Set Primary Domain' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementPrimaryDomain( ':site', ':domain' ),
			'Domain Management › Set Primary Domain'
		);

		renderWithReduxStore(
			<DomainManagement.PrimaryDomain
				selectedDomainName={ pageContext.params.domain }
			/>,
			document.getElementById( 'primary' ),
			pageContext.store
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

		renderWithReduxStore(
			<WhoisData
				component={ DomainManagement.ContactsPrivacy }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain } />,
			document.getElementById( 'primary' ),
			pageContext.store
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

		renderWithReduxStore(
			<WhoisData
				component={ DomainManagement.EditContactInfo }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain } />,
			document.getElementById( 'primary' ),
			pageContext.store
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
		setTitle(
			i18n.translate( 'Email Forwarding' ),
			pageContext
		);

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
		setTitle(
			i18n.translate( 'DNS Records' ),
			pageContext
		);

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
		setTitle(
			i18n.translate( 'Name Servers and DNS' ),
			pageContext
		);

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
		setTitle(
			i18n.translate( 'Privacy Protection' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementPrivacyProtection( ':site', ':domain' ),
			'Domain Management › Contacts and Privacy › Privacy Protection'
		);

		renderWithReduxStore(
			<WhoisData
				component={ DomainManagement.PrivacyProtection }
				context={ pageContext }
				selectedDomainName={ pageContext.params.domain } />,
			document.getElementById( 'primary' ),
			pageContext.store
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
		setTitle(
			i18n.translate( 'Redirect Settings' ),
			pageContext
		);

		analytics.pageView.record(
			paths.domainManagementRedirectSettings( ':site', ':domain' ),
			'Domain Management › Redirect Settings'
		);

		renderWithReduxStore(
			<SiteRedirectData
				component={ DomainManagement.SiteRedirect }
				selectedDomainName={ pageContext.params.domain } />,
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
		setTitle(
			i18n.translate( 'Transfer Domain' ),
			pageContext
		);

		renderWithReduxStore(
			<TransferData
				component={ DomainManagement.Transfer }
				selectedDomainName={ pageContext.params.domain } />,
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

		setTitle(
			i18n.translate( 'Transfer Domain' ),
			pageContext
		);

		renderWithReduxStore(
			<TransferData
				component={ DomainManagement.TransferToOtherUser }
				selectedDomainName={ pageContext.params.domain } />,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	},

	domainManagementTransferOut( pageContext ) {
		setTitle(
			i18n.translate( 'Transfer Domain' ),
			pageContext
		);

		renderWithReduxStore(
			<TransferData
				component={ DomainManagement.TransferOut }
				selectedDomainName={ pageContext.params.domain } />,
			document.getElementById( 'primary' ),
			pageContext.store
		);
	}
};
