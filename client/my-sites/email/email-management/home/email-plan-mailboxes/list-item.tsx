import { CompactCard } from '@automattic/components';
import clsx from 'clsx';
import React from 'react';

type Props = React.PropsWithChildren< {
	isError?: boolean;
	isPlaceholder?: boolean;
	hasNoEmails?: boolean;
} >;

const MailboxListItem = ( { children, isError = false, isPlaceholder, hasNoEmails }: Props ) => {
	const className = clsx( 'email-plan-mailboxes-list__mailbox-list-item', {
		'is-placeholder': isPlaceholder,
		'no-emails': hasNoEmails,
	} );
	return (
		<CompactCard className={ className } highlight={ isError ? 'error' : null }>
			{ children }
		</CompactCard>
	);
};

export default MailboxListItem;
