/**
 * Internal dependencies
 */
import { convertToCamelCase } from 'state/data-layer/utils';

const getLoginLink = ( account, mailbox ) => {
	return (
		{
			titan: 'https://web.flockmail.com/',
			gapps: `https://accounts.google.com/AccountChooser?Email=${ mailbox.meta.email }&service=CPanel&continue=https://admin.google.com/a/${ account.domain_name }`,
		}[ account.product_type ] ?? null
	);
};

const getDoesAccountNeedFixing = ( account, mailbox ) => {
	return (
		{
			titan: false,
			gapps: mailbox.meta?.has_agreed_to_terms ?? false,
		}[ account.product_type ] ?? false
	);
};

export const prepareAccounts = ( accounts ) => {
	const preparedAccounts = ( accounts ?? [] ).map( ( account ) => {
		account.mailboxes = ( account.mailboxes ?? [] ).map( ( mailbox ) => {
			mailbox.meta = mailbox.meta ?? {};
			// Compose the email address
			mailbox.meta.email = `${ mailbox.name }@${ account.domain_name }`;
			// Login link
			mailbox.meta.login_link = getLoginLink( account, mailbox );
			// A property that depicts if this mailbox needs fixing
			mailbox.meta.needs_fixing = getDoesAccountNeedFixing( account, mailbox );
			return mailbox;
		} );
		return account;
	} );
	return convertToCamelCase( preparedAccounts );
};
