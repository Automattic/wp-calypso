import { SiteDomain } from '@automattic/api-core';
import {
	queryClient,
	rawUserPreferencesQuery,
	sitesQuery,
	siteDomainsQuery,
	mailboxAccountsQuery,
} from '@automattic/api-queries';
import { createLazyRoute, createRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { domainHasEmail } from '../../utils/domain';
import { rootRoute } from './root';

export const emailsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Emails' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails',
	loader: async () => {
		// Preload user prefs used broadly
		const prefsPromise = queryClient.ensureQueryData( rawUserPreferencesQuery() );

		// 1) Preload sites
		const sites = await queryClient.ensureQueryData( sitesQuery() );
		const managedSites = ( sites ?? [] ).filter( ( site ) => site.capabilities?.manage_options );

		// 2) Preload domains for each managed site
		const domainsArrays = await Promise.all(
			managedSites.map( ( site ) => queryClient.ensureQueryData( siteDomainsQuery( site.ID ) ) )
		);

		// 3) From those domains, identify ones with email capability and preload their mailboxes
		const allDomains = domainsArrays.flat().filter( ( d: SiteDomain ) => d && ! d.wpcom_domain );
		const domainsWithEmails = allDomains.filter( ( d ) => domainHasEmail( d ) );

		await Promise.all( [
			prefsPromise,
			...domainsWithEmails.map( ( domain ) =>
				queryClient.ensureQueryData( mailboxAccountsQuery( domain.blog_id, domain.domain ) )
			),
		] );
	},
} ).lazy( () =>
	import( '../../emails' ).then( ( d ) =>
		createLazyRoute( 'emails' )( {
			component: d.default,
		} )
	)
);

export const chooseDomainRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Choose a domain' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails/choose-domain',
	loader: async () => {
		// 1) Preload sites
		const sites = await queryClient.ensureQueryData( sitesQuery() );
		const managedSites = ( sites ?? [] ).filter( ( site ) => site.capabilities?.manage_options );

		// 2) Preload domains for each managed site
		await Promise.all(
			managedSites.map( ( site ) => queryClient.ensureQueryData( siteDomainsQuery( site.ID ) ) )
		);
	},
} ).lazy( () =>
	import( '../../emails/choose-domain' ).then( ( d ) =>
		createLazyRoute( 'choose-domain' )( {
			component: d.default,
		} )
	)
);

export const chooseEmailSolutionRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Choose email solution' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails/choose-email-solution/$domain',
} ).lazy( () =>
	import( '../../emails/choose-email-solution' ).then( ( d ) =>
		createLazyRoute( 'choose-email-solution' )( {
			component: d.default,
		} )
	)
);

export const addTitanmailMailboxRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Add Titan Mail mailbox' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails/add-titan-mailbox',
} ).lazy( () =>
	import( '../../emails/add-titan-mailbox' ).then( ( d ) =>
		createLazyRoute( 'add-titan-mailbox' )( {
			component: d.default,
		} )
	)
);

export const addGoogleMailboxRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Add Google mailbox' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails/add-google-mailbox',
} ).lazy( () =>
	import( '../../emails/add-google-mailbox' ).then( ( d ) =>
		createLazyRoute( 'add-google-mailbox' )( {
			component: d.default,
		} )
	)
);

export const addEmailForwarderRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Add Email Forwarder' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails/add-forwarder',
} ).lazy( () =>
	import( '../../emails/add-forwarder' ).then( ( d ) =>
		createLazyRoute( 'add-email-forwarder' )( {
			component: d.default,
		} )
	)
);

export const createEmailsRoutes = () => {
	return [
		emailsRoute,
		chooseDomainRoute,
		chooseEmailSolutionRoute,
		addTitanmailMailboxRoute,
		addGoogleMailboxRoute,
		addEmailForwarderRoute,
	];
};
