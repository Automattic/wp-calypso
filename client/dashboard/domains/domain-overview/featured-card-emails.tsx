import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { Domain } from '../../data/domain';
import OverviewCard from '../../sites/overview-card';
import type { Mailbox, EmailProvider } from '../../data/emails';

const getAccountTypeLabel = ( accountType: EmailProvider ) => {
	switch ( accountType ) {
		case 'google_workspace':
			return __( 'Google Workspace' );
		case 'email_forwarding':
			return __( 'Email Forwarding' );
		case 'titan':
		default:
			return __( 'Professional Email' );
	}
};

const getAdditionlMailboxesLabel = ( count: number ) => {
	return count === 1
		? __( '+ one more mailbox' )
		: sprintf(
				// translators: %d is the number of additional mailboxes.
				__( '+ %d more mailboxes' ),
				count
		  );
};

interface Props {
	domain: Domain;
	mailboxes: Mailbox[];
}

export default function FeaturedCardEmails( { domain, mailboxes }: Props ) {
	const additionalMailboxes = mailboxes.length - 1;

	const description =
		additionalMailboxes > 0
			? getAdditionlMailboxesLabel( additionalMailboxes )
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
