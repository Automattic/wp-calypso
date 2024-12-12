import { Badge, MaterialIcon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils';
import { isEmailUserAdmin } from 'calypso/lib/emails';
import { getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite';
import EmailMailboxActionMenu from 'calypso/my-sites/email/email-management/home/email-mailbox-action-menu';
import EmailMailboxWarnings from 'calypso/my-sites/email/email-management/home/email-mailbox-warnings';
import EmailForwardSecondaryDetails from './email-plan-mailboxes/email-forward-secondary-details';
import MailboxListHeader from './email-plan-mailboxes/list-header';
import MailboxListItem from './email-plan-mailboxes/list-item';
import MailboxLink from './email-plan-mailboxes/list-item-link';
import type { EmailAccount, Mailbox } from 'calypso/data/emails/types';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type Props = {
	domain: ResponseDomain;
	account: EmailAccount;
	mailboxes: Mailbox[];
	addMailboxPath: string;
	isLoadingEmails: boolean;
	configuringStateMode?: 'message' | 'notice';
};
function EmailPlanMailboxesList( {
	domain,
	account,
	mailboxes,
	addMailboxPath,
	isLoadingEmails,
	configuringStateMode = 'message',
}: Props ) {
	const translate = useTranslate();
	const accountType = account?.account_type;

	const isGoogleConfiguring =
		isRecentlyRegistered( domain.registrationDate, 45 ) &&
		getGSuiteSubscriptionStatus( domain ) === 'unknown';

	if ( isLoadingEmails ) {
		return (
			<MailboxListHeader isPlaceholder>
				<MailboxListItem isPlaceholder>
					<MaterialIcon icon="email" />
					<span />
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	if ( isGoogleConfiguring && configuringStateMode === 'message' ) {
		return (
			<MailboxListHeader accountType={ accountType }>
				<MailboxListItem hasNoEmails>
					<span>
						{ translate(
							'We are configuring your mailboxes. You will receive an email shortly when they are ready to use.'
						) }
					</span>
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	if ( isNoMailboxes ) {
		return (
			<MailboxListHeader accountType={ accountType }>
				<MailboxListItem hasNoEmails>
					<span>{ translate( 'No mailboxes' ) }</span>
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	const mailboxItems = mailboxes.map( ( mailbox ) => {
		const mailboxHasWarnings = Boolean( mailbox?.warnings?.length );

		return (
			<>
				<MailboxListItem key={ mailbox.mailbox } isError={ mailboxHasWarnings }>
					<div className="email-plan-mailboxes-list__mailbox-list-item-main">
						<MailboxLink account={ account } mailbox={ mailbox } readonly={ isGoogleConfiguring } />
						<EmailForwardSecondaryDetails mailbox={ mailbox } />
					</div>
					{ isEmailUserAdmin( mailbox ) && (
						<Badge type="info">
							{ translate( 'Admin', {
								comment: 'Email user role displayed as a badge',
							} ) }
						</Badge>
					) }

					<EmailMailboxWarnings account={ account } mailbox={ mailbox } />
					{ ! mailbox.temporary && ! isGoogleConfiguring && (
						<EmailMailboxActionMenu account={ account } domain={ domain } mailbox={ mailbox } />
					) }
				</MailboxListItem>
			</>
		);
	} );

	return (
		<>
			{ isGoogleConfiguring && configuringStateMode === 'notice' && (
				<Notice
					className="email-plan-mailboxes-list__notice"
					status="is-warning"
					showDismiss={ false }
					text={ translate(
						'We are configuring your mailboxes. You will receive an email shortly when they are ready to use.'
					) }
				>
					<NoticeAction>{ translate( 'Finish setup' ) }</NoticeAction>
				</Notice>
			) }
			<MailboxListHeader
				accountType={ accountType }
				addMailboxPath={ addMailboxPath }
				showIcon={ !! addMailboxPath }
				domain={ domain }
				disableActions
			>
				{ mailboxItems }
			</MailboxListHeader>
		</>
	);
}

export default EmailPlanMailboxesList;
