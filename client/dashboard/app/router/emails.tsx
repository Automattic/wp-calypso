import { Domain, DomainSubtype, isWpError } from '@automattic/api-core';
import {
	domainQuery,
	mailboxAccountsQuery,
	productsQuery,
	queryClient,
	rawUserPreferencesQuery,
	siteByIdQuery,
	siteDomainsQuery,
	sitesQuery,
} from '@automattic/api-queries';
import { createLazyRoute, createRoute, redirect } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { MailboxProvider, IntervalLength } from '../../emails/types';
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
		const allDomains = domainsArrays
			.flat()
			.filter( ( d: Domain ) => d.subtype.id !== DomainSubtype.DEFAULT_ADDRESS );
		const domainsWithEmails = allDomains.filter( ( d ) => domainHasEmail( d ) );

		await Promise.all( [
			prefsPromise,
			...domainsWithEmails.map( ( domain ) =>
				queryClient.ensureQueryData( mailboxAccountsQuery( domain.blog_id, domain.domain ) )
			),
		] );
	},
	validateSearch: ( search ): { domainName: string | undefined } => {
		return {
			domainName: typeof search.domainName === 'string' ? search.domainName : undefined,
		};
	},
} ).lazy( () =>
	import( '../../emails' ).then( ( d ) =>
		createLazyRoute( 'emails' )( {
			component: d.default,
		} )
	)
);

const redirectIfInvalidDomain = async ( domainName: string ) => {
	try {
		await queryClient.ensureQueryData( domainQuery( domainName ) );
	} catch ( error ) {
		const supportedErrors = [
			[ 400, 'invalid_domain' ],
			[ 403, 'authorization_required' ],
		];
		if (
			isWpError( error ) &&
			supportedErrors.some(
				( [ code, errorType ] ) => error.statusCode === code && error.error === errorType
			)
		) {
			throw redirect( {
				to: emailsRoute.fullPath,
				search: {
					domainName,
				},
			} );
		}
	}
};

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
				title: __( 'Choose an email solution' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails/choose-email-solution/$domain',
	beforeLoad: async ( { params: { domain: domainName } } ) => {
		await redirectIfInvalidDomain( domainName );
	},
	loader: async ( { params: { domain: domainName } } ) => {
		const products = queryClient.ensureQueryData( productsQuery() );

		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		const site = queryClient.ensureQueryData( siteByIdQuery( domain.blog_id ) );

		await Promise.all( [ products, site, domain ] );
	},
} ).lazy( () =>
	import( '../../emails/choose-email-solution' ).then( ( d ) =>
		createLazyRoute( 'choose-email-solution' )( {
			component: d.default,
		} )
	)
);

export const addMailboxRoute = createRoute( {
	head: ( { params } ) => ( {
		meta: [
			{
				title:
					params.provider === MailboxProvider.Titan
						? __( 'Add Professional Email' )
						: __( 'Add Google Workspace' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'emails/add-mailbox/$domain/$provider/$interval',
	beforeLoad: async ( { params: { domain: domainName, provider, interval } } ) => {
		await redirectIfInvalidDomain( domainName );

		if (
			// @ts-expect-error The provider param can be anything.
			! Object.values( MailboxProvider ).includes( provider ) ||
			// @ts-expect-error The interval param can be anything.
			! Object.values( IntervalLength ).includes( interval )
		) {
			throw redirect( {
				to: chooseEmailSolutionRoute.to,
				params: { domain: domainName },
			} );
		}
	},
	loader: async ( { params: { domain: domainName } } ) => {
		const products = queryClient.ensureQueryData( productsQuery() );

		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		const site = queryClient.ensureQueryData( siteByIdQuery( domain.blog_id ) );
		const mailboxAccounts = await queryClient.ensureQueryData(
			mailboxAccountsQuery( domain.blog_id, domainName )
		);

		await Promise.all( [ products, site, domain, mailboxAccounts ] );
	},
} ).lazy( () =>
	import( '../../emails/add-mailbox' ).then( ( d ) =>
		createLazyRoute( 'add-mailbox' )( {
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
		addMailboxRoute,
		addEmailForwarderRoute,
	];
};
