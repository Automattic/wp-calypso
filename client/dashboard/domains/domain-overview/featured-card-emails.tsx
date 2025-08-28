import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { mailboxesQuery } from '../../app/queries/emails';
import { emailsRoute } from '../../app/router/emails';
import { Domain } from '../../data/domain';
import OverviewCard from '../../sites/overview-card';
import type { EmailProvider, Mailbox } from '../../data/emails';

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

const getDescription = ( mailboxes: Mailbox[] ) => {
	const additionalMailboxes = mailboxes.length - 1;

	if ( mailboxes.length === 0 ) {
		return __( 'Add professional email' );
	}

	return additionalMailboxes > 0
		? getAdditionlMailboxesLabel( additionalMailboxes )
		: getAccountTypeLabel( mailboxes[ 0 ].account_type );
};

interface Props {
	domain: Domain;
}

export default function FeaturedCardEmails( { domain }: Props ) {
	const { data: mailboxes } = useSuspenseQuery( mailboxesQuery( domain.blog_id ) );

	const email = mailboxes.length
		? `${ mailboxes[ 0 ].mailbox }@${ domain.domain }`
		: // translators: %s is the mailbox name: youremail@example.com
		  sprintf( __( 'youremail@%s' ), domain.domain );

	return (
		<OverviewCard
			title={ __( 'Emails' ) }
			heading={ <span style={ { wordBreak: 'break-all' } }>{ email }</span> }
			link={ emailsRoute.fullPath }
			icon={ <Icon icon={ envelope } /> }
			description={ getDescription( mailboxes ) }
		/>
	);
}
