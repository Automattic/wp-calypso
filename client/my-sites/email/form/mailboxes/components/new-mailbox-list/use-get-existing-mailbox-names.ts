import { useSelector } from 'react-redux';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import {
	EMAIL_ACCOUNT_TYPE_GOOGLE_WORKSPACE,
	EMAIL_ACCOUNT_TYPE_GSUITE,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL,
} from 'calypso/lib/emails/email-provider-constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

interface ExistingMailAccount {
	account_type: string;
	emails: {
		email_type: string;
		mailbox: string;
	}[];
}

const getEmailAccountTypes = ( provider: EmailProvider ): string[] =>
	( {
		[ EmailProvider.Titan ]: [
			EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
			EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL,
		],
		[ EmailProvider.Google ]: [ EMAIL_ACCOUNT_TYPE_GOOGLE_WORKSPACE, EMAIL_ACCOUNT_TYPE_GSUITE ],
	}[ provider ] );

const useGetExistingMailboxNames = (
	provider: EmailProvider,
	selectedDomainName: string
): string[] => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const {
		data: { accounts } = {},
		error,
		isLoading,
	} = useGetEmailAccountsQuery( selectedSiteId as number, selectedDomainName );

	if ( error || isLoading || ! accounts ) {
		return [];
	}

	const emailAccountTypes = getEmailAccountTypes( provider );

	return ( accounts as ExistingMailAccount[] )
		.filter( ( { account_type } ) => emailAccountTypes.includes( account_type ) )
		.flatMap( ( { emails } ) => emails.map( ( { mailbox } ) => mailbox ) );
};

export default useGetExistingMailboxNames;
