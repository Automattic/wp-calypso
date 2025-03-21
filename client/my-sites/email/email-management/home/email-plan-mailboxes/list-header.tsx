import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback } from 'react';
import SectionHeader from 'calypso/components/section-header';
import { EMAIL_ACCOUNT_TYPE_FORWARD } from 'calypso/lib/emails/email-provider-constants';
import EmailTypeIcon from '../email-type-icon';
import ContextMenu from './context-menu';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type Props = React.PropsWithChildren< {
	accountType?: string | null;
	isPlaceholder?: boolean;
	addMailboxPath?: string;
	domain?: ResponseDomain;
	showIcon?: boolean;
	showContextMenu?: boolean;
	disableActions?: boolean;
} >;
const MailboxListHeader = ( {
	accountType = null,
	children,
	isPlaceholder = false,
	addMailboxPath,
	domain,
	showIcon,
	showContextMenu = false,
	disableActions,
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
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					<Button href={ addMailboxPath } variant="link" disabled={ !! disableActions }>
						{ translate( 'Add mailbox' ) }
					</Button>
				) }
				{ showContextMenu && (
					<ContextMenu
						domain={ domain }
						className="email-plan-mailboxes-list__mailbox-context-menu"
					/>
				) }
			</SectionHeader>
			{ children }
		</div>
	);
};

export default MailboxListHeader;
