/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { Button, CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { EMAIL_ACCOUNT_TYPE_FORWARD } from 'calypso/lib/emails/email-provider-constants';
import MaterialIcon from 'calypso/components/material-icon';
import SectionHeader from 'calypso/components/section-header';
import Badge from 'calypso/components/badge';
import {
	getEmailForwardAddress,
	isEmailForward,
	isEmailForwardVerified,
	isEmailUserAdmin,
} from 'calypso/lib/emails';
import {
	getGmailUrl,
	getGoogleAdminUrl,
	getGoogleCalendarUrl,
	getGoogleDocsUrl,
	getGoogleDriveUrl,
	getGoogleSheetsUrl,
	getGoogleSlidesUrl,
} from 'calypso/lib/gsuite';
import gmailIcon from 'calypso/assets/images/email-providers/google-workspace/services/gmail.svg';
import googleAdminIcon from 'calypso/assets/images/email-providers/google-workspace/services/admin.svg';
import googleCalendarIcon from 'calypso/assets/images/email-providers/google-workspace/services/calendar.svg';
import googleDocsIcon from 'calypso/assets/images/email-providers/google-workspace/services/docs.svg';
import googleDriveIcon from 'calypso/assets/images/email-providers/google-workspace/services/drive.svg';
import googleSheetsIcon from 'calypso/assets/images/email-providers/google-workspace/services/sheets.svg';
import googleSlidesIcon from 'calypso/assets/images/email-providers/google-workspace/services/slides.svg';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resendVerificationEmail } from 'calypso/state/email-forwarding/actions';
import titanCalendarIcon from 'calypso/assets/images/email-providers/titan/services/calendar.svg';
import titanContactsIcon from 'calypso/assets/images/email-providers/titan/services/contacts.svg';
import titanMailIcon from 'calypso/assets/images/email-providers/titan/services/mail.svg';
import Gridicon from 'calypso/components/gridicon';

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

const MailboxListItemWarning = ( { warningText } ) => {
	return (
		<div className="email-plan-mailboxes-list__mailbox-list-item-warning">
			<Gridicon icon="info-outline" size={ 18 } />
			<span>{ warningText }</span>
		</div>
	);
};

const MailboxListItemAction = ( { buttonText, onClick } ) => {
	return (
		<div className="email-plan-mailboxes-list__mailbox-list-item-action">
			<Button compact onClick={ onClick }>
				{ buttonText }
			</Button>
		</div>
	);
};

const resendEmailForwardVerification = ( mailbox, dispatch ) => {
	const destination = getEmailForwardAddress( mailbox );
	dispatch(
		recordTracksEvent(
			'calypso_email_management_email_forwarding_resend_verification_email_click',
			{
				destination,
				domain_name: mailbox.domain,
				mailbox: mailbox.mailbox,
			}
		)
	);
	dispatch( resendVerificationEmail( mailbox.domain, mailbox.mailbox, destination ) );
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

const getActionsForMailbox = ( mailbox, translate, dispatch ) => {
	if ( isEmailForward( mailbox ) && ! isEmailForwardVerified( mailbox ) ) {
		return {
			action: (
				<MailboxListItemAction
					buttonText={ translate( 'Resend verification email' ) }
					onClick={ () => resendEmailForwardVerification( mailbox, dispatch ) }
				/>
			),
			warning: <MailboxListItemWarning warningText={ translate( 'Verification required' ) } />,
		};
	}

	return {
		action: null,
		warning: null,
	};
};

const TitanActionMenu = () => {
	const translate = useTranslate();

	return (
		<EllipsisMenu
			popoverClassName="email-plan-mailboxes-list__mailbox-action-menu-popover"
			className="email-plan-mailboxes-list__mailbox-action-menu"
		>
			<PopoverMenuItem
				href="https://wp.titan.email/mail/"
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
			>
				<img src={ titanMailIcon } alt={ translate( 'Titan Mail icon' ) } />
				{ translate( 'Mail', {
					comment: 'This refers to the Email application (i.e. the webmail) of Titan',
				} ) }
			</PopoverMenuItem>
			<PopoverMenuItem
				href="https://wp.titan.email/calendar/"
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
			>
				<img src={ titanCalendarIcon } alt={ translate( 'Titan Calendar icon' ) } />
				{ translate( 'Calendar', {
					comment: 'This refers to the Calendar application of Titan',
				} ) }
			</PopoverMenuItem>
			<PopoverMenuItem
				href="https://wp.titan.email/contacts/"
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
			>
				<img src={ titanContactsIcon } alt={ translate( 'Titan Contacts icon' ) } />
				{ translate( 'Contacts', {
					comment: 'This refers to the Contacts application of Titan',
				} ) }
			</PopoverMenuItem>
		</EllipsisMenu>
	);
};

const GmailActionMenu = ( { domainName } ) => {
	const translate = useTranslate();

	return (
		<EllipsisMenu
			className="email-plan-mailboxes-list__mailbox-action-menu"
			popoverClassName="email-plan-mailboxes-list__mailbox-action-menu-popover"
		>
			<PopoverMenuItem
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
				href={ getGmailUrl( domainName ) }
			>
				<img src={ gmailIcon } alt={ translate( 'Gmail icon' ) } />
				View Gmail
			</PopoverMenuItem>

			<PopoverMenuItem
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
				href={ getGoogleAdminUrl( domainName ) }
			>
				<img src={ googleAdminIcon } alt={ translate( 'Google Admin icon' ) } />
				View Admin
			</PopoverMenuItem>

			<PopoverMenuItem
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
				href={ getGoogleCalendarUrl( domainName ) }
			>
				<img src={ googleCalendarIcon } alt={ translate( 'Google Calendar icon' ) } />
				View Calendar
			</PopoverMenuItem>

			<PopoverMenuItem
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
				href={ getGoogleDocsUrl( domainName ) }
			>
				<img src={ googleDocsIcon } alt={ translate( 'Google Docs icon' ) } />
				View Docs
			</PopoverMenuItem>

			<PopoverMenuItem
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
				href={ getGoogleDriveUrl( domainName ) }
			>
				<img src={ googleDriveIcon } alt={ translate( 'Google Drive icon' ) } />
				View Drive
			</PopoverMenuItem>

			<PopoverMenuItem
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
				href={ getGoogleSheetsUrl( domainName ) }
			>
				<img src={ googleSheetsIcon } alt={ translate( 'Google Sheets icon' ) } />
				View Sheets
			</PopoverMenuItem>

			<PopoverMenuItem
				className="email-plan-mailboxes-list__mailbox-action-menu-item"
				isExternalLink={ true }
				href={ getGoogleSlidesUrl( domainName ) }
			>
				<img src={ googleSlidesIcon } alt={ translate( 'Google Slides icon' ) } />
				View Slides
			</PopoverMenuItem>
		</EllipsisMenu>
	);
};

function EmailPlanMailboxesList( { accountType, domain, isLoadingEmails, mailboxes } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

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
		return (
			<MailboxListHeader accountType={ accountType }>
				<MailboxListItem hasNoEmails>
					<span>{ translate( 'No mailboxes' ) }</span>
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	const mailboxItems = mailboxes.map( ( mailbox ) => {
		const { action, warning } = getActionsForMailbox( mailbox, translate, dispatch );

		return (
			<MailboxListItem key={ mailbox.mailbox } isError={ !! warning }>
				<div className="email-plan-mailboxes-list__mailbox-list-item-email">
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
					{ warning }
					{ action }
				</div>
				{ hasTitanMailWithUs( domain ) ? (
					<TitanActionMenu domain={ domain } />
				) : (
					<GmailActionMenu domainName={ domain.name } />
				) }
			</MailboxListItem>
		);
	} );

	return <MailboxListHeader accountType={ accountType }>{ mailboxItems }</MailboxListHeader>;
}

EmailPlanMailboxesList.propTypes = {
	accountType: PropTypes.string,
	domain: PropTypes.object,
	isLoadingEmails: PropTypes.bool,
	mailboxes: PropTypes.array,
};

export default EmailPlanMailboxesList;
