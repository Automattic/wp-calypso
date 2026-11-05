import { Domain } from '@automattic/api-core';
import { mailboxAccountsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function DomainEmailsSettingsSummary( {
	domain,
	onClick,
}: {
	domain: Domain;
	onClick?: () => void;
} ) {
	const { data: accounts } = useQuery( mailboxAccountsQuery( domain.blog_id, domain.domain ) );

	// A Google Workspace account can span several domains, so only count the
	// mailboxes belonging to this domain.
	const mailboxCount = accounts
		?.flatMap( ( account ) => account.emails )
		.filter( ( box ) => box.domain === domain.domain ).length;

	// Only a known zero offers the add flow: while loading or after a failure the
	// domain may already have mailboxes.
	const linkProps =
		mailboxCount === 0
			? { to: `/emails/choose-email-solution/${ domain.domain }` }
			: { to: '/emails', search: { domainName: domain.domain } };

	const badges = mailboxCount
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
			title={ __( 'Emails' ) }
			badges={ badges }
			density="medium"
			onClick={ onClick }
		/>
	);
}
