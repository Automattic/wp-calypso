import { PartialDomainData } from '@automattic/data-stores';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { getDomainType } from '../utils/get-domain-type';

interface DomainsTableEmailIndicatorProps {
	domain: PartialDomainData;
	siteSlug: string;
}

export const DomainsTableEmailIndicator = ( {
	domain,
	siteSlug,
}: DomainsTableEmailIndicatorProps ) => {
	const { __, _n } = useI18n();

	if ( ! [ 'mapped', 'registered' ].includes( getDomainType( domain ) ) ) {
		return '-';
	}

	const googleStatus = domain.google_apps_subscription?.status || '';
	const titanStatus = domain.titan_mail_subscription?.status || '';

	let message = null;

	if ( googleStatus && ! [ '', 'no_subscription', 'other_provider' ].includes( googleStatus ) ) {
		const count = domain?.google_apps_subscription?.total_user_count ?? 0;

		message = sprintf(
			/* translators: The number of GSuite mailboxes active for the current domain */
			_n( '%(count)d mailbox', '%(count)d mailboxes', count ),
			{
				count,
			}
		);
	} else if ( titanStatus && ( titanStatus === 'active' || titanStatus === 'suspended' ) ) {
		const count = domain.titan_mail_subscription?.maximum_mailbox_count ?? 1;

		message = sprintf(
			/* translators: The number of mailboxes for the current domain */
			_n( '%(count)d mailbox', '%(count)d mailboxes', count ),
			{
				count,
			}
		);
	} else if ( domain.email_forwards_count > 0 ) {
		const count = domain.email_forwards_count;

		message = sprintf(
			/* translators: The number of email forwards active for the current domain */
			_n( '%(count)d forward', '%(count)d forwards', count ),
			{
				count,
			}
		);
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
			{ __( '+ Add email' ) }
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
