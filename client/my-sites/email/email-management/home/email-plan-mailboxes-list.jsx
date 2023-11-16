import { Badge, CompactCard, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import MaterialIcon from 'calypso/components/material-icon';
import SectionHeader from 'calypso/components/section-header';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils';
import { getEmailForwardAddress, isEmailForward, isEmailUserAdmin } from 'calypso/lib/emails';
import { EMAIL_ACCOUNT_TYPE_FORWARD } from 'calypso/lib/emails/email-provider-constants';
import { getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite';
import EmailMailboxActionMenu from 'calypso/my-sites/email/email-management/home/email-mailbox-action-menu';
import EmailMailboxWarnings from 'calypso/my-sites/email/email-management/home/email-mailbox-warnings';

const getListHeaderTextForAccountType = ( accountType, translate ) => {
	if ( accountType === EMAIL_ACCOUNT_TYPE_FORWARD ) {
		return translate( 'Email forwards', {
			comment:
				'This is a header for a list of email addresses that forward all emails to another email account',
		} );
	}
	return translate( 'Mailboxes', {
		comment: 'This is a header for a list of email addresses the user owns',
	} );
};

const MailboxListHeader = ( { accountType = null, children, isPlaceholder = false } ) => {
	const translate = useTranslate();

	return (
		<div className="email-plan-mailboxes-list__mailbox-list">
			<SectionHeader
				isPlaceholder={ isPlaceholder }
				label={ getListHeaderTextForAccountType( accountType, translate ) }
			/>
			{ children }
		</div>
	);
};

const MailboxListItem = ( { children, isError = false, isPlaceholder, hasNoEmails } ) => {
	const className = classNames( 'email-plan-mailboxes-list__mailbox-list-item', {
		'is-placeholder': isPlaceholder,
		'no-emails': hasNoEmails,
	} );
	return (
		<CompactCard className={ className } highlight={ isError ? 'error' : null }>
			{ children }
		</CompactCard>
	);
};

const MailboxListItemSecondaryDetails = ( { children, className } ) => {
	const fullClassName = classNames(
		'email-plan-mailboxes-list__mailbox-secondary-details',
		className
	);
	return <div className={ fullClassName }>{ children }</div>;
};

const getSecondaryContentForMailbox = ( mailbox ) => {
	if ( isEmailForward( mailbox ) ) {
		return (
			<MailboxListItemSecondaryDetails className="email-plan-mailboxes-list__mailbox-list-forward">
				<Gridicon icon="chevron-right" />
				<span>{ getEmailForwardAddress( mailbox ) }</span>
			</MailboxListItemSecondaryDetails>
		);
	}
	return null;
};

function EmailPlanMailboxesList( { account, domain, isLoadingEmails, mailboxes } ) {
	const translate = useTranslate();
	const accountType = account?.account_type;

	if ( isLoadingEmails ) {
		return (
			<MailboxListHeader isPlaceholder accountType={ accountType }>
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
					<div>
						<MaterialIcon icon="email" />
						<span>
							{ mailbox.mailbox }@{ mailbox.domain }
						</span>
					</div>
					{ getSecondaryContentForMailbox( mailbox ) }
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

	return <MailboxListHeader accountType={ accountType }>{ mailboxItems }</MailboxListHeader>;
}

EmailPlanMailboxesList.propTypes = {
	account: PropTypes.object,
	domain: PropTypes.object,
	isLoadingEmails: PropTypes.bool,
	mailboxes: PropTypes.array,
};

export default EmailPlanMailboxesList;
