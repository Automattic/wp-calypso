import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback } from 'react';
import SectionHeader from 'calypso/components/section-header';
import { EMAIL_ACCOUNT_TYPE_FORWARD } from 'calypso/lib/emails/email-provider-constants';
import EmailTypeIcon from '../email-type-icon';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type Props = React.PropsWithChildren< {
	accountType?: string | null;
	isPlaceholder?: boolean;
	addMailboxPath?: string;
	domain?: ResponseDomain;
	showIcon?: boolean;
} >;
const MailboxListHeader = ( {
	accountType = null,
	children,
	isPlaceholder = false,
	addMailboxPath,
	domain,
	showIcon,
}: Props ) => {
	const translate = useTranslate();

	const getListHeaderTextForAccountType = useCallback( () => {
		if ( accountType === EMAIL_ACCOUNT_TYPE_FORWARD ) {
			return translate( 'Email forwards', {
				comment:
					'This is a header for a list of email addresses that forward all emails to another email account',
			} );
		}
		return translate( 'Mailboxes', {
			comment: 'This is a header for a list of email addresses the user owns',
		} );
	}, [ translate, accountType ] );

	const HeaderIcon = useCallback(
		() => (
			<div className="email-plan-mailboxes-list__mailbox-header-icon">
				<EmailTypeIcon domain={ domain } />
			</div>
		),
		[ domain ]
	);

	return (
		<div className="email-plan-mailboxes-list__mailbox-list">
			<SectionHeader
				isPlaceholder={ isPlaceholder }
				label={
					<>
						{ !! showIcon && domain && <HeaderIcon /> }
						{ getListHeaderTextForAccountType() }
					</>
				}
			>
				{ addMailboxPath && (
					<Button isLink href={ addMailboxPath }>
						{ translate( 'Add mailbox' ) }
					</Button>
				) }
			</SectionHeader>
			{ children }
		</div>
	);
};

export default MailboxListHeader;
