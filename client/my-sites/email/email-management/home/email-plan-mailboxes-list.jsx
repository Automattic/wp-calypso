/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { Button, CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'calypso/components/badge';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { EMAIL_ACCOUNT_TYPE_FORWARD } from 'calypso/lib/emails/email-provider-constants';
import { emailManagementForwarding } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
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
import {
	getTitanCalendarlUrl,
	getTitanContactsUrl,
	getTitanEmailUrl,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import gmailIcon from 'calypso/assets/images/email-providers/google-workspace/services/gmail.svg';
import googleAdminIcon from 'calypso/assets/images/email-providers/google-workspace/services/admin.svg';
import googleCalendarIcon from 'calypso/assets/images/email-providers/google-workspace/services/calendar.svg';
import googleDocsIcon from 'calypso/assets/images/email-providers/google-workspace/services/docs.svg';
import googleDriveIcon from 'calypso/assets/images/email-providers/google-workspace/services/drive.svg';
import googleSheetsIcon from 'calypso/assets/images/email-providers/google-workspace/services/sheets.svg';
import googleSlidesIcon from 'calypso/assets/images/email-providers/google-workspace/services/slides.svg';
import Gridicon from 'calypso/components/gridicon';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import MaterialIcon from 'calypso/components/material-icon';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resendVerificationEmail } from 'calypso/state/email-forwarding/actions';
import SectionHeader from 'calypso/components/section-header';
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
			title: translate( 'View Mail', {
				comment: 'View the Email application (i.e. the webmail) for Titan',
			} ),
		},
		{
			href: getTitanCalendarlUrl( email ),
			image: titanCalendarIcon,
			imageAltText: translate( 'Titan Calendar icon' ),
			title: translate( 'View Calendar', {
				comment: 'View the Calendar application for Titan',
			} ),
		},
		{
			href: getTitanContactsUrl( email ),
			image: titanContactsIcon,
			imageAltText: translate( 'Titan Contacts icon' ),
			title: translate( 'View Contacts', {
				comment: 'View the Contacts application for Titan',
			} ),
		},
	];
};

const getGSuiteMenuItems = ( email, mailbox, translate ) => {
	return [
		{
			href: getGmailUrl( email ),
			image: gmailIcon,
			imageAltText: translate( 'Gmail icon' ),
			title: translate( 'View Gmail' ),
		},
		...( isEmailUserAdmin( mailbox )
			? [
					{
						href: getGoogleAdminUrl( email ),
						image: googleAdminIcon,
						imageAltText: translate( 'Google Admin icon' ),
						title: translate( 'View Admin' ),
					},
			  ]
			: [] ),
		{
			href: getGoogleCalendarUrl( email ),
			image: googleCalendarIcon,
			imageAltText: translate( 'Google Calendar icon' ),
			title: translate( 'View Calendar' ),
		},
		{
			href: getGoogleDocsUrl( email ),
			image: googleDocsIcon,
			imageAltText: translate( 'Google Docs icon' ),
			title: translate( 'View Docs' ),
		},
		{
			href: getGoogleDriveUrl( email ),
			image: googleDriveIcon,
			imageAltText: translate( 'Google Drive icon' ),
			title: translate( 'View Drive' ),
		},
		{
			href: getGoogleSheetsUrl( email ),
			image: googleSheetsIcon,
			imageAltText: translate( 'Google Sheets icon' ),
			title: translate( 'View Sheets' ),
		},
		{
			href: getGoogleSlidesUrl( email ),
			image: googleSlidesIcon,
			imageAltText: translate( 'Google Slides icon' ),
			title: translate( 'View Slides' ),
		},
	];
};

const getEmailForwardMenuItems = ( { currentRoute, domain, selectedSite, translate } ) => {
	return [
		{
			href: emailManagementForwarding( selectedSite.slug, domain.name, currentRoute ),
			isInternalLink: true,
			materialIcon: 'create',
			title: translate( 'Edit', {
				comment: 'Edit an email forward',
			} ),
		},
	];
};

const getMenuItems = ( { currentRoute, domain, email, mailbox, selectedSite }, translate ) => {
	if ( hasTitanMailWithUs( domain ) ) {
		return getTitanMenuItems( email, translate );
	}

	if ( hasGSuiteWithUs( domain ) ) {
		return getGSuiteMenuItems( email, mailbox, translate );
	}

	if ( hasEmailForwards( domain ) ) {
		return getEmailForwardMenuItems( { currentRoute, domain, selectedSite, translate } );
	}

	return null;
};

const ActionMenu = ( { domain, mailbox, selectedSite } ) => {
	const currentRoute = useSelector( getCurrentRoute );
	const translate = useTranslate();
	const email = `${ mailbox.mailbox }@${ mailbox.domain }`;
	const menuItems = getMenuItems(
		{ currentRoute, domain, email, mailbox, selectedSite },
		translate
	);
	if ( ! menuItems ) {
		return null;
	}
	return (
		<EllipsisMenu className="email-plan-mailboxes-list__mailbox-action-menu">
			{ menuItems.map(
				( { href, image, imageAltText, isInternalLink = false, materialIcon, title } ) => (
					<PopoverMenuItem
						key={ href }
						className="email-plan-mailboxes-list__mailbox-action-menu-item"
						isExternalLink={ ! isInternalLink }
						href={ href }
					>
						{ image && <img src={ image } alt={ imageAltText } /> }
						{ materialIcon && <MaterialIcon icon={ materialIcon } /> }
						{ title }
					</PopoverMenuItem>
				)
			) }
		</EllipsisMenu>
	);
};

function EmailPlanMailboxesList( {
	accountType,
	domain,
	isLoadingEmails,
	mailboxes,
	selectedSite,
} ) {
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
				<ActionMenu domain={ domain } mailbox={ mailbox } selectedSite={ selectedSite } />
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
	selectedSite: PropTypes.object,
};

export default EmailPlanMailboxesList;
