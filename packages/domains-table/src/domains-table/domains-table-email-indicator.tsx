import { PartialDomainData } from '@automattic/data-stores';
import { translate } from 'i18n-calypso';
import { getDomainType } from '../utils/get-domain-type';

export const DomainsTableEmailIndicator = ( {
	domain,
	siteSlug,
}: {
	domain: PartialDomainData;
	siteSlug: string;
} ) => {
	// mailbox logic below moved from client/my-sites/domains/domain-management/list/domain-row.jsx

	if ( ! [ 'mapped', 'registered' ].includes( getDomainType( domain ) ) ) {
		return null;
	}

	const googleStatus = domain.google_apps_subscription?.status || '';
	const titanStatus = domain.titan_mail_subscription?.status || '';

	let message = null;

	if ( googleStatus && ! [ '', 'no_subscription', 'other_provider' ].includes( googleStatus ) ) {
		const count = domain?.google_apps_subscription?.total_user_count ?? 0;

		message = translate( '%(count)d mailbox', '%(count)d mailboxes', {
			count,
			args: {
				count,
			},
			comment: 'The number of GSuite mailboxes active for the current domain',
		} );
	} else if ( titanStatus && ( titanStatus === 'active' || titanStatus === 'suspended' ) ) {
		const count = domain.titan_mail_subscription?.maximum_mailbox_count ?? 1;
		message = translate( '%(count)d mailbox', '%(count)d mailboxes', {
			args: {
				count,
			},
			count,
			comment: '%(count)d is the number of mailboxes for the current domain',
		} );
	} else if ( domain.email_forwards_count > 0 ) {
		message = translate( '%(count)d forward', '%(count)d forwards', {
			count: domain.email_forwards_count,
			args: {
				count: domain.email_forwards_count,
			},
			comment: 'The number of email forwards active for the current domain',
		} );
	}

	if ( message ) {
		return (
			<a
				className="domains-table-view-email-button"
				href={ emailManagementEdit( siteSlug, domain.domain ) }
			>
				{ message }
			</a>
		);
	}

	if ( ! domain.current_user_can_add_email ) {
		return '-';
	}

	return (
		<a
			className="domains-table-add-email-button"
			href={ `/email/${ domain.domain }/manage/${ siteSlug }` }
		>
			{ translate( '+ Add email' ) }
		</a>
	);
};

export function emailManagementEdit( siteSlug: string, domainName: string ) {
	// Encodes only real domain names and not parameter placeholders
	if ( domainName && ! String( domainName ).startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	return '/email/' + domainName + '/manage/' + siteSlug;
}
