import { Badge, MaterialIcon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
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
};
function EmailPlanMailboxesList( {
	domain,
	account,
	mailboxes,
	addMailboxPath,
	isLoadingEmails,
}: Props ) {
	const translate = useTranslate();
	const accountType = account?.account_type;

	if ( isLoadingEmails ) {
		return (
			<MailboxListHeader isPlaceholder accountType={ accountType } domain={ domain }>
				<MailboxListItem isPlaceholder>
					<MaterialIcon icon="email" />
					<span />
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	if ( ! mailboxes || mailboxes.length < 1 ) {
		let missingMailboxesText = translate( 'No mailboxes' );

		if (
			isRecentlyRegistered( domain.registrationDate, 45 ) &&
			getGSuiteSubscriptionStatus( domain ) === 'unknown'
		) {
			missingMailboxesText = translate(
				'We are configuring your mailboxes. You will receive an email shortly when they are ready to use.'
			);
		}

		return (
			<MailboxListHeader accountType={ accountType }>
				<MailboxListItem hasNoEmails>
					<span>{ missingMailboxesText }</span>
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	const mailboxItems = mailboxes.map( ( mailbox ) => {
		const mailboxHasWarnings = Boolean( mailbox?.warnings?.length );

		return (
			<MailboxListItem key={ mailbox.mailbox } isError={ mailboxHasWarnings }>
				<div className="email-plan-mailboxes-list__mailbox-list-item-main">
					<MailboxLink account={ account } mailbox={ mailbox } />
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

				{ ! mailbox.temporary && (
					<EmailMailboxActionMenu account={ account } domain={ domain } mailbox={ mailbox } />
				) }
			</MailboxListItem>
		);
	} );

	return (
		<MailboxListHeader
			accountType={ accountType }
			addMailboxPath={ addMailboxPath }
			showIcon={ !! addMailboxPath }
			domain={ domain }
		>
			{ mailboxItems }
		</MailboxListHeader>
	);
}

export default EmailPlanMailboxesList;
