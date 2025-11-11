import { Domain } from '@automattic/api-core';
import { mailboxesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { emailsRoute } from '../../app/router/emails';
import OverviewCard from '../../components/overview-card';
import { Truncate } from '../../components/truncate';
import type { EmailProvider, Mailbox } from '@automattic/api-core';

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
		return __( 'Stand out with professional email.' );
	}

	return additionalMailboxes > 0
		? getAdditionlMailboxesLabel( additionalMailboxes )
		: getAccountTypeLabel( mailboxes[ 0 ].account_type );
};

interface Props {
	domain: Domain;
}

export default function FeaturedCardEmails( { domain }: Props ) {
	const router = useRouter();

	const { data: mailboxes } = useQuery( mailboxesQuery( domain.blog_id ) );
	if ( mailboxes === undefined ) {
		return <OverviewCard icon={ <Icon icon={ envelope } /> } title={ __( 'Emails' ) } isLoading />;
	}

	const email = mailboxes.length
		? `${ mailboxes[ 0 ].mailbox }@${ domain.domain }`
		: // translators: %s is the mailbox name: youremail@example.com
		  __( 'No email address' );

	return (
		<OverviewCard
			title={ mailboxes.length > 0 ? __( 'Emails' ) : __( 'Add mailbox' ) }
			heading={
				<Truncate tooltip={ email } numberOfLines={ 1 }>
					{ email }
				</Truncate>
			}
			link={
				router.buildLocation( {
					to: emailsRoute.fullPath,
					search: { domainName: domain.domain },
				} ).href
			}
			icon={ <Icon icon={ envelope } /> }
			description={ getDescription( mailboxes ) }
		/>
	);
}
