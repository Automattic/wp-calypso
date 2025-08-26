import { Icon } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { Domain } from '../../data/domain';
import OverviewCard from '../../sites/overview-card';
import type { Mailbox, EmailProvider } from '../../data/emails';

const getAccountTypeLabel = ( accountType: EmailProvider ) => {
	switch ( accountType ) {
		case 'google_workspace':
			return __( 'Google Workspace' );
		case 'forwarding':
			return __( 'Forwarding' );
		case 'titan':
		default:
			return __( 'Professional Email' );
	}
};

interface Props {
	domain: Domain;
	mailboxes: Mailbox[];
}

export default function FeaturedCardEmails( { domain, mailboxes }: Props ) {
	const additionalMailboxes = mailboxes.length - 1;

	const description =
		additionalMailboxes > 0
			? // eslint-disable-next-line @wordpress/valid-sprintf
			  sprintf(
					// translators: %d is the number of additional mailboxes.
					_n( '+ one more mailbox', '+ %d more mailboxes', additionalMailboxes ),
					additionalMailboxes
			  )
			: getAccountTypeLabel( mailboxes[ 0 ].account_type );

	return (
		<OverviewCard
			title={ __( 'Emails' ) }
			heading={
				<span style={ { wordBreak: 'break-all' } }>
					{ `${ mailboxes[ 0 ].mailbox }@${ domain.domain }` }
				</span>
			}
			icon={ <Icon icon={ envelope } /> }
			description={ description }
		/>
	);
}
