/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { Button, CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'calypso/components/badge';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { EMAIL_ACCOUNT_TYPE_FORWARD } from 'calypso/lib/emails/email-provider-constants';
import MaterialIcon from 'calypso/components/material-icon';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import SectionHeader from 'calypso/components/section-header';
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
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import gmailIcon from 'calypso/assets/images/email-providers/google-workspace/services/gmail.svg';
import googleAdminIcon from 'calypso/assets/images/email-providers/google-workspace/services/admin.svg';
import googleCalendarIcon from 'calypso/assets/images/email-providers/google-workspace/services/calendar.svg';
import googleDocsIcon from 'calypso/assets/images/email-providers/google-workspace/services/docs.svg';
import googleDriveIcon from 'calypso/assets/images/email-providers/google-workspace/services/drive.svg';
import googleSheetsIcon from 'calypso/assets/images/email-providers/google-workspace/services/sheets.svg';
import googleSlidesIcon from 'calypso/assets/images/email-providers/google-workspace/services/slides.svg';
import Gridicon from 'calypso/components/gridicon';
import {
	getTitanEmailUrl,
	getTitanCalendarlUrl,
	getTitanContactsUrl,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resendVerificationEmail } from 'calypso/state/email-forwarding/actions';
import titanCalendarIcon from 'calypso/assets/images/email-providers/titan/services/calendar.svg';
import titanContactsIcon from 'calypso/assets/images/email-providers/titan/services/contacts.svg';
import titanMailIcon from 'calypso/assets/images/email-providers/titan/services/mail.svg';

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

/**
 * Returns the available menu items for Titan Emails
 *
 * @param {string} email The email address of the Titan account
 * @param {Function} translate The translate function
 * @returns Array of menu items
 */
const getTitanMenuItems = ( email, translate ) => {
	return [
		{
			href: getTitanEmailUrl( email ),
			image: titanMailIcon,
			imageAltText: translate( 'Titan Mail icon' ),
			title: translate( 'Mail', {
				comment: 'This refers to the Email application (i.e. the webmail) of Titan',
			} ),
		},
		{
			href: getTitanCalendarlUrl( email ),
			image: titanCalendarIcon,
			imageAltText: translate( 'Titan Calendar icon' ),
			title: translate( 'Calendar', {
				comment: 'This refers to the Calendar application of Titan',
			} ),
		},
		{
			href: getTitanContactsUrl( email ),
			image: titanContactsIcon,
			imageAltText: translate( 'Titan Contacts icon' ),
			title: translate( 'Contacts', {
				comment: 'This refers to the Contacts application of Titan',
			} ),
		},
	];
};

const getGSuiteMenuItems = ( domainName, translate ) => {
	return [
		{
			href: getGmailUrl( domainName ),
			image: gmailIcon,
			imageAltText: translate( 'Gmail icon' ),
			title: translate( 'View Gmail' ),
		},
		{
			href: getGoogleAdminUrl( domainName ),
			image: googleAdminIcon,
			imageAltText: translate( 'Google Admin icon' ),
			title: translate( 'View Admin' ),
		},
		{
			href: getGoogleCalendarUrl( domainName ),
			image: googleCalendarIcon,
			imageAltText: translate( 'Google Calendar icon' ),
			title: translate( 'View Calendar' ),
		},
		{
			href: getGoogleDocsUrl( domainName ),
			image: googleDocsIcon,
			imageAltText: translate( 'Google Docs icon' ),
			title: translate( 'View Docs' ),
		},
		{
			href: getGoogleDriveUrl( domainName ),
			image: googleDriveIcon,
			imageAltText: translate( 'Google Drive icon' ),
			title: translate( 'View Drive' ),
		},
		{
			href: getGoogleSheetsUrl( domainName ),
			image: googleSheetsIcon,
			imageAltText: translate( 'Google Sheets icon' ),
			title: translate( 'View Sheets' ),
		},
		{
			href: getGoogleSlidesUrl( domainName ),
			image: googleSlidesIcon,
			imageAltText: translate( 'Google Slides icon' ),
			title: translate( 'View Slides' ),
		},
	];
};

const getMenuItems = ( { domain, email }, translate ) => {
	if ( hasTitanMailWithUs( domain ) ) {
		return getTitanMenuItems( email, translate );
	}

	if ( hasGSuiteWithUs( domain ) ) {
		return getGSuiteMenuItems( email || domain.name, translate );
	}

	return null;
};

const ActionMenu = ( { domain, mailbox } ) => {
	const translate = useTranslate();
	const email = `${ mailbox.mailbox }@${ mailbox.domain }`;
	const menuItems = getMenuItems( { domain, email }, translate );
	if ( ! menuItems ) {
		return null;
	}
	return (
		<EllipsisMenu className="email-plan-mailboxes-list__mailbox-action-menu">
			{ menuItems.map( ( { image, imageAltText, href, title } ) => (
				<PopoverMenuItem
					key={ href }
					className="email-plan-mailboxes-list__mailbox-action-menu-item"
					isExternalLink
					href={ href }
				>
					<img src={ image } alt={ imageAltText } />
					{ title }
				</PopoverMenuItem>
			) ) }
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
				<ActionMenu domain={ domain } mailbox={ mailbox } />
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
