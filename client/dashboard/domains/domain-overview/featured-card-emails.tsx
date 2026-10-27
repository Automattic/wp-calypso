import { Domain } from '@automattic/api-core';
import { mailboxAccountsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { emailsRoute, chooseEmailSolutionRoute } from '../../app/router/emails';
import OverviewCard from '../../components/overview-card';
import type { EmailProvider } from '@automattic/api-core';

interface DomainMailbox {
	accountType: EmailProvider;
	emailAddress: string;
}

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

const getDescription = ( mailboxes: DomainMailbox[] ) => {
	if ( mailboxes.length === 0 ) {
		return __( 'Stand out with professional email.' );
	}

	const additionalMailboxes = mailboxes.length - 1;

	return additionalMailboxes > 0
		? getAdditionlMailboxesLabel( additionalMailboxes )
		: getAccountTypeLabel( mailboxes[ 0 ].accountType );
};

interface Props {
	domain: Domain;
}

export default function FeaturedCardEmails( { domain }: Props ) {
	const router = useRouter();

	const { data: accounts } = useQuery( mailboxAccountsQuery( domain.blog_id, domain.domain ) );
	if ( accounts === undefined ) {
		return <OverviewCard icon={ <Icon icon={ envelope } /> } title={ __( 'Emails' ) } isLoading />;
	}

	const mailboxes = accounts.flatMap( ( account ) =>
		account.emails
			// A Google Workspace account can span several domains, so only keep the
			// mailboxes belonging to the domain this card is about.
			.filter( ( box ) => box.domain === domain.domain )
			.map( ( box ) => ( {
				accountType: account.account_type,
				emailAddress: `${ box.mailbox }@${ box.domain }`,
			} ) )
	);

	const email = mailboxes.length ? mailboxes[ 0 ].emailAddress : __( 'No email address' );

	return (
		<OverviewCard
			title={ mailboxes.length > 0 ? __( 'Emails' ) : __( 'Add mailbox' ) }
			heading={ email }
			link={
				mailboxes.length > 0
					? router.buildLocation( {
							to: emailsRoute.fullPath,
							search: { domainName: domain.domain },
						} ).href
					: router.buildLocation( {
							to: chooseEmailSolutionRoute.fullPath,
							params: { domain: domain.domain },
						} ).href
			}
			icon={ <Icon icon={ envelope } /> }
			description={ getDescription( mailboxes ) }
			intent={ mailboxes.length > 0 ? 'success' : 'upsell' }
		/>
	);
}
