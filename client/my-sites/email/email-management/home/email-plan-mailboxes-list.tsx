import { Badge, MaterialIcon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils';
import { isEmailUserAdmin } from 'calypso/lib/emails';
import { EMAIL_ACCOUNT_TYPE_FORWARD } from 'calypso/lib/emails/email-provider-constants';
import { getGSuiteSubscriptionStatus, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import EmailMailboxActionMenu from 'calypso/my-sites/email/email-management/home/email-mailbox-action-menu';
import EmailMailboxWarnings from 'calypso/my-sites/email/email-management/home/email-mailbox-warnings';
import EmailPlanWarnings from 'calypso/my-sites/email/email-management/home/email-plan-warnings';
import EmailForwardHeader from './email-plan-mailboxes/email-forward-header';
import EmailForwardSecondaryDetails from './email-plan-mailboxes/email-forward-secondary-details';
import EmailUpgradeNotice from './email-plan-mailboxes/email-upgrade-notice';
import MailboxListHeader from './email-plan-mailboxes/list-header';
import MailboxListItem from './email-plan-mailboxes/list-item';
import MailboxLink from './email-plan-mailboxes/list-item-link';
import type { EmailAccount, Mailbox } from 'calypso/data/emails/types';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type Props = {
	context: 'domains' | 'email' | 'hosting-overview';
	domain: ResponseDomain;
	account: EmailAccount;
	mailboxes: Mailbox[];
	actionPathProps?: {
		disabled: boolean;
		path: string;
	};
	purchaseNewEmailAccountPath?: string;
	isLoadingEmails: boolean;
};
function EmailPlanMailboxesList( {
	context,
	domain,
	account,
	mailboxes,
	actionPathProps,
	purchaseNewEmailAccountPath,
	isLoadingEmails,
}: Props ) {
	const translate = useTranslate();
	const accountType = account?.account_type;

	const isDesktopResolution = useDesktopBreakpoint();
	const isNoMailboxes = ! mailboxes || mailboxes.length < 1;
	const isAccountWarningPresent = !! account?.warnings.length;
	const isGoogleConfiguring =
		isRecentlyRegistered( domain.registrationDate, 45 ) &&
		getGSuiteSubscriptionStatus( domain ) === 'unknown';

	function MailboxListEmpty() {
		return (
			<MailboxListItem>
				<div className="email-plan-mailboxes-list__mailbox-list-item-main">
					<div className="email-plan-mailboxes-list__mailbox-list-link disabled">
						<span>{ domain.domain }</span>
					</div>
				</div>
			</MailboxListItem>
		);
	}

	function MailboxContentInfo( { type }: { type: 'configuring' | 'no-mailboxes' } ) {
		let message;

		switch ( type ) {
			case 'no-mailboxes':
				message = translate( 'No mailboxes' );
				break;
			case 'configuring':
				message = translate(
					'We are configuring your mailboxes. You will receive an email shortly when they are ready to use.'
				);
				break;
		}

		return (
			<MailboxListHeader accountType={ accountType }>
				<MailboxListItem hasNoEmails>
					<span>{ message }</span>
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	function MailboxItems() {
		return mailboxes.map( ( mailbox ) => {
			const mailboxHasWarnings = Boolean( mailbox?.warnings?.length );
			const showErrorStyling = context === 'email' && mailboxHasWarnings;

			return (
				<>
					<MailboxListItem key={ mailbox.mailbox } isError={ showErrorStyling }>
						<div className="email-plan-mailboxes-list__mailbox-list-item-main">
							<MailboxLink
								account={ account }
								mailbox={ mailbox }
								readonly={ isGoogleConfiguring }
							/>
							{ context === 'email' && <EmailForwardSecondaryDetails mailbox={ mailbox } /> }
						</div>
						{ ( context === 'domains' || context === 'hosting-overview' ) && (
							<div className="email-plan-mailboxes-list__mailbox-list-item-main">
								<EmailForwardSecondaryDetails
									mailbox={ mailbox }
									hideIcon={ isDesktopResolution }
								/>
								{ mailboxHasWarnings && (
									<div className="email-mailbox-warnings">
										<EmailMailboxWarnings
											account={ account }
											mailbox={ mailbox }
											ctaProps={ { primary: true, borderless: true, compact: false } }
										/>
									</div>
								) }
							</div>
						) }
						{ isEmailUserAdmin( mailbox ) && (
							<Badge type="info">
								{ translate( 'Admin', {
									comment: 'Email user role displayed as a badge',
								} ) }
							</Badge>
						) }

						{ context === 'email' && (
							<EmailMailboxWarnings account={ account } mailbox={ mailbox } />
						) }
						{ ! mailbox.temporary && ! isGoogleConfiguring && (
							<EmailMailboxActionMenu account={ account } domain={ domain } mailbox={ mailbox } />
						) }
					</MailboxListItem>
				</>
			);
		} );
	}

	/**
	 * ↓ Template rendering
	 */
	// Common loading placeholder
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

	// Rendering based on the context
	switch ( context ) {
		case 'domains':
		case 'hosting-overview':
			return (
				<>
					{ ( isGoogleConfiguring || isAccountWarningPresent ) && (
						<Notice
							className="email-plan-mailboxes-list__notice"
							status="is-warning"
							showDismiss={ false }
						>
							{ isAccountWarningPresent ? (
								<EmailPlanWarnings
									domain={ domain }
									emailAccount={ account }
									ctaBtnProps={ { primary: false, plain: true } }
								/>
							) : (
								translate(
									'We are configuring your mailboxes. You will receive an email shortly when they are ready to use.'
								)
							) }
						</Notice>
					) }

					{ accountType === EMAIL_ACCOUNT_TYPE_FORWARD && (
						<>
							<EmailForwardHeader
								className="email-plan-mailboxes-list__mailbox-list"
								actionPath={ ( ! actionPathProps?.disabled && actionPathProps?.path ) || undefined }
							>
								<MailboxItems />
							</EmailForwardHeader>
							{ ! hasGSuiteWithUs( domain ) && ! hasTitanMailWithUs( domain ) && (
								<EmailUpgradeNotice path={ purchaseNewEmailAccountPath } />
							) }
						</>
					) }

					{ accountType !== EMAIL_ACCOUNT_TYPE_FORWARD && (
						<MailboxListHeader
							accountType={ accountType }
							addMailboxPath={
								( ! actionPathProps?.disabled && actionPathProps?.path ) || undefined
							}
							showIcon={ !! actionPathProps }
							showContextMenu
							domain={ domain }
							disableActions={ isGoogleConfiguring }
						>
							{ isNoMailboxes ? <MailboxListEmpty /> : <MailboxItems /> }
						</MailboxListHeader>
					) }
				</>
			);

		case 'email':
		default: {
			if ( isGoogleConfiguring ) {
				return <MailboxContentInfo type="configuring" />;
			}

			if ( isNoMailboxes ) {
				return <MailboxContentInfo type="no-mailboxes" />;
			}

			return (
				<MailboxListHeader
					accountType={ accountType }
					addMailboxPath={ ( ! actionPathProps?.disabled && actionPathProps?.path ) || undefined }
					showIcon={ !! actionPathProps }
					domain={ domain }
					disableActions={ isGoogleConfiguring }
				>
					{ isNoMailboxes ? <MailboxListEmpty /> : <MailboxItems /> }
				</MailboxListHeader>
			);
		}
	}
}

export default EmailPlanMailboxesList;
