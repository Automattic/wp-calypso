import { PartialDomainData } from '@automattic/data-stores';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { type as domainTypes } from '../utils/constants';
import { getDomainType } from '../utils/get-domain-type';
import { emailManagementEdit } from '../utils/paths';
import type { DomainsTableContext } from './domains-table';
import type { MouseEvent } from 'react';

interface DomainsTableEmailIndicatorProps {
	domain: PartialDomainData;
	siteSlug: string;
	context?: DomainsTableContext;
}

export const DomainsTableEmailIndicator = ( {
	domain,
	siteSlug,
	context,
}: DomainsTableEmailIndicatorProps ) => {
	const { __, _n } = useI18n();

	const domainType = getDomainType( domain );

	if ( domainType !== domainTypes.MAPPED && domainType !== domainTypes.REGISTERED ) {
		return '-';
	}

	const googleStatus = domain.google_apps_subscription?.status;
	const titanStatus = domain.titan_mail_subscription?.status;

	let message = '';

	if ( googleStatus && ! [ 'no_subscription', 'other_provider' ].includes( googleStatus ) ) {
		const count = domain.google_apps_subscription?.total_user_count ?? 0;

		message = sprintf(
			/* translators: The number of GSuite mailboxes active for the current domain */
			_n( '%(count)d mailbox', '%(count)d mailboxes', count ),
			{
				count,
			}
		);
	} else if ( titanStatus === 'active' || titanStatus === 'suspended' ) {
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
				href={ emailManagementEdit( siteSlug, domain.domain, context ) }
				onClick={ ( e: MouseEvent ) => e.stopPropagation() }
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
			href={ emailManagementEdit( siteSlug, domain.domain, context ) }
			onClick={ ( e: MouseEvent ) => e.stopPropagation() }
		>
			{ __( '+ Add email' ) }
		</a>
	);
};
