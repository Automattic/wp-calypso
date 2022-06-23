import { useSelector } from 'react-redux';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import {
	EMAIL_ACCOUNT_TYPE_GOOGLE_WORKSPACE,
	EMAIL_ACCOUNT_TYPE_GSUITE,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL,
} from 'calypso/lib/emails/email-provider-constants';
import {
	EmailProvider,
	ExistingMailboxNameType,
} from 'calypso/my-sites/email/form/mailboxes/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
	selectedDomainName: string,
	isInitialMailboxPurchase = true
): Map< string, ExistingMailboxNameType > => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const {
		data: emailAccounts = [],
		error,
		isLoading,
	} = useGetEmailAccountsQuery( selectedSiteId as number, selectedDomainName, {
		notifyOnChangeProps: [ 'data' ],
		enabled: ! isInitialMailboxPurchase,
	} );

	const mailboxNames = new Map< string, ExistingMailboxNameType >();

	if ( error || isLoading || ! emailAccounts.length ) {
		return mailboxNames;
	}

	const emailAccountTypes = getEmailAccountTypes( provider );

	emailAccounts
		.filter( ( { account_type } ) => emailAccountTypes.includes( account_type ) )
		.flatMap( ( { emails } ) => emails.map( ( { mailbox } ) => mailbox ) )
		.forEach( ( mailboxName ) => mailboxNames.set( mailboxName, 'exists' ) );

	return mailboxNames;
};

export default useGetExistingMailboxNames;
