import { Domain } from '@automattic/api-core';
import { emailForwardersQuery } from '@automattic/api-queries';
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
	const { data } = useQuery( emailForwardersQuery( domain.domain ) );

	// Each target of a forwarder is its own entry, so count unique addresses.
	const forwarderCount =
		data && new Set( ( data.forwards ?? [] ).map( ( forward ) => forward.mailbox ) ).size;

	// Only a known zero offers the add flow: while loading or after a failure the
	// domain may already have forwarders. The add-forwarder page decides whether the
	// domain is eligible.
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
