import { EmailBox, isWpError } from '@automattic/api-core';
import {
	domainQuery,
	domainsQuery,
	mailboxAccountsQuery,
	productsQuery,
	queryClient,
	rawUserPreferencesQuery,
	siteByIdQuery,
	userMailboxesQuery,
} from '@automattic/api-queries';
import { createLazyRoute, createRoute, redirect, Outlet } from '@tanstack/react-router';
import { __, _n } from '@wordpress/i18n';
import { IntervalLength, MailboxProvider } from '../../emails/types';
import { accountHasWarningWithSlug } from '../../utils/email-utils';
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
	component: () => <Outlet />,
	validateSearch: ( search ): { domainName: string | undefined } => {
		return {
			domainName: typeof search.domainName === 'string' ? search.domainName : undefined,
		};
	},
} );

export const emailsIndexRoute = createRoute( {
	getParentRoute: () => emailsRoute,
	path: '/',
	loader: async () => {
		await Promise.all( [
			queryClient.ensureQueryData( userMailboxesQuery() ),
			queryClient.ensureQueryData( domainsQuery() ),
			queryClient.ensureQueryData( rawUserPreferencesQuery() ),
		] );
	},
} ).lazy( () =>
	import( '../../emails' ).then( ( d ) =>
		createLazyRoute( 'emails-index' )( {
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
	getParentRoute: () => emailsRoute,
	path: 'choose-domain',
	loader: async () => {
		queryClient.prefetchQuery( domainsQuery() );
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
	getParentRoute: () => emailsRoute,
	path: 'choose-email-solution/$domain',
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
	getParentRoute: () => emailsRoute,
	path: 'add-mailbox/$domain/$provider/$interval',
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

export const setUpMailboxRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Set Up Mailbox' ),
			},
		],
	} ),
	getParentRoute: () => emailsRoute,
	path: 'set-up-mailbox/$domain',
	beforeLoad: async ( { params: { domain: domainName } } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );

		await redirectIfInvalidDomain( domainName );

		const existingMailboxes = await queryClient.ensureQueryData(
			mailboxAccountsQuery( domain.blog_id, domainName )
		);

		const unusedMailboxesCount = existingMailboxes?.some(
			( mailbox ) =>
				mailbox.warnings.some( ( w ) => w.warning_slug === 'unused_mailboxes' ) &&
				mailbox.maximum_mailboxes - ( mailbox.emails.length || 0 )
		);

		const hasUnusedMailbox = !! unusedMailboxesCount;

		if ( ! hasUnusedMailbox ) {
			throw redirect( {
				to: emailsRoute.fullPath,
				search: {
					domainName,
				},
			} );
		}
	},
	loader: async ( { params: { domain: domainName } } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		const mailboxAccounts = await queryClient.ensureQueryData(
			mailboxAccountsQuery( domain.blog_id, domainName )
		);

		await Promise.all( [ domain, mailboxAccounts ] );
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
	getParentRoute: () => emailsRoute,
	path: 'add-forwarder',
} ).lazy( () =>
	import( '../../emails/add-forwarder' ).then( ( d ) =>
		createLazyRoute( 'add-email-forwarder' )( {
			component: d.default,
		} )
	)
);

export const mailboxesReadyRoute = createRoute( {
	head: ( { loaderData }: { loaderData?: { emails: EmailBox[]; status: string } } ) => {
		let title;
		if ( loaderData?.status === 'ready' ) {
			title = _n(
				'Your mailbox is ready!',
				'Your mailboxes are ready!',
				loaderData?.emails.length ?? 0
			);
		} else {
			title = _n(
				'Your mailbox is almost ready!',
				'Your mailboxes are almost ready!',
				loaderData?.emails.length ?? 0
			);
		}
		return { meta: [ { title } ] };
	},
	getParentRoute: () => emailsRoute,
	path: 'mailboxes-ready/$domain',
	beforeLoad: async ( { params: { domain: domainName } } ) => {
		await redirectIfInvalidDomain( domainName );
	},
	loader: async ( { location, params: { domain: domainName } } ) => {
		const search: Record< string, string > = location.search;
		const mailboxes = search.mailboxes?.split( ',' ) ?? [];

		// Intentional call to `fetchQuery` instead of `ensureQueryData` to bypass cache and always fetch fresh data.
		const domain = await queryClient.fetchQuery( domainQuery( domainName ) );
		const mailboxAccounts = await queryClient.fetchQuery(
			mailboxAccountsQuery( domain.blog_id, domainName )
		);

		const mailboxAccount = mailboxAccounts.find(
			( mailboxAccount ) => mailboxAccount.account_type !== 'email_forwarding'
		);
		const emails =
			mailboxAccount?.emails.filter( ( { mailbox } ) => mailboxes.includes( mailbox ) ) ?? [];

		let status;
		if (
			mailboxAccount?.account_type === 'google_workspace' &&
			accountHasWarningWithSlug( 'google_pending_tos_acceptance', mailboxAccount )
		) {
			status = 'google_pending_tos_acceptance';
		} else if (
			mailboxAccount?.account_type === 'google_workspace' &&
			domain.google_apps_subscription?.status === 'unknown'
		) {
			status = 'google_configuring';
		} else {
			status = 'ready';
		}

		return {
			mailboxAccount,
			emails,
			status,
		};
	},
} ).lazy( () =>
	import( '../../emails/mailboxes-ready' ).then( ( d ) =>
		createLazyRoute( 'mailboxes-ready' )( {
			component: d.default,
		} )
	)
);

export const createEmailsRoutes = () => {
	return [
		emailsRoute.addChildren( [
			emailsIndexRoute,
			chooseDomainRoute,
			chooseEmailSolutionRoute,
			addMailboxRoute,
			setUpMailboxRoute,
			addEmailForwarderRoute,
			mailboxesReadyRoute,
		] ),
	];
};
