import { Domain, EmailProvider } from '@automattic/api-core';
import { mailboxAccountsQuery } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function DomainEmailForwardingSettingsSummary( {
	domain,
	onClick,
}: {
	domain: Domain;
	onClick?: () => void;
} ) {
	const { data: accounts } = useQuery( mailboxAccountsQuery( domain.blog_id, domain.domain ) );

	// A domain that can host forwarding always has a forwarding account, even with no forwarders.
	const forwardingAccounts = accounts?.filter(
		( account ) =>
			account.account_type === EmailProvider.Forwarding &&
			account.domains.some( ( binding ) => binding.domain === domain.domain )
	);

	// Each target of a forwarder is its own entry, so count unique addresses.
	const forwarderCount = forwardingAccounts?.length
		? new Set(
				forwardingAccounts
					.flatMap( ( account ) => account.emails )
					.filter( ( box ) => box.domain === domain.domain )
					.map( ( box ) => box.mailbox )
			).size
		: undefined;

	// Only a known zero offers the add flow: while loading or after a failure the
	// domain may already have forwarders.
	const linkProps =
		forwarderCount === 0 && domain.current_user_can_add_email
			? { to: '/emails/add-forwarder', search: { domainName: domain.domain } }
			: { to: '/emails', search: { domainName: domain.domain } };

	const badges = forwarderCount
		? [
				{
					text: sprintf(
						// translators: %s is the number of email forwarders on the domain.
						_n( '%s forwarder', '%s forwarders', forwarderCount ),
						formatNumber( forwarderCount )
					),
					intent: 'stable' as const,
				},
			]
		: [];

	return (
		<RouterLinkSummaryButton
			{ ...linkProps }
			title={ __( 'Email forwarding' ) }
			badges={ badges }
			density="medium"
			onClick={ onClick }
		/>
	);
}
