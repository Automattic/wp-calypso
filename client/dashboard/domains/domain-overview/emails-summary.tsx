import { Domain } from '@automattic/api-core';
import { mailboxAccountsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import { emailsRoute, chooseEmailSolutionRoute } from '../../app/router/emails';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function DomainEmailsSettingsSummary( { domain }: { domain: Domain } ) {
	const { data: accounts } = useQuery( mailboxAccountsQuery( domain.blog_id, domain.domain ) );

	// A Google Workspace account can span several domains, so only count the
	// mailboxes belonging to this domain.
	const mailboxCount = ( accounts ?? [] ).reduce(
		( count, account ) =>
			count + account.emails.filter( ( box ) => box.domain === domain.domain ).length,
		0
	);

	const linkProps =
		mailboxCount > 0
			? { to: emailsRoute.fullPath, search: { domainName: domain.domain } }
			: { to: chooseEmailSolutionRoute.fullPath, params: { domain: domain.domain } };

	const badges =
		mailboxCount > 0
			? [
					{
						text: sprintf(
							// translators: %d is the number of mailboxes on the domain.
							_n( '%d mailbox', '%d mailboxes', mailboxCount ),
							mailboxCount
						),
						intent: 'stable' as const,
					},
				]
			: [];

	return (
		<RouterLinkSummaryButton
			{ ...linkProps }
			title={ __( 'Professional email' ) }
			badges={ badges }
			density="medium"
		/>
	);
}
