/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import {
	getEmailForwardAddress,
	hasGoogleAccountTOSWarning,
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
import gmailIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/gmail.svg';
import googleAdminIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/admin.svg';
import googleCalendarIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/calendar.svg';
import googleDocsIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/docs.svg';
import googleDriveIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/drive.svg';
import googleSheetsIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/sheets.svg';
import googleSlidesIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/slides.svg';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import MaterialIcon from 'calypso/components/material-icon';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import { removeEmailForward } from 'calypso/state/email-forwarding/actions';
import titanCalendarIcon from 'calypso/assets/images/email-providers/titan/services/flat/calendar.svg';
import titanContactsIcon from 'calypso/assets/images/email-providers/titan/services/flat/contacts.svg';
import titanMailIcon from 'calypso/assets/images/email-providers/titan/services/flat/mail.svg';

const removeEmailForwardMailbox = ( { dispatch, mailbox } ) => {
	recordTracksEvent( 'calypso_email_management_email_forwarding_delete_click', {
		destination: getEmailForwardAddress( mailbox ),
		domain_name: mailbox.domain,
		mailbox: mailbox.mailbox,
	} );

	dispatch( removeEmailForward( mailbox.domain, mailbox.mailbox ) );
};

/**
 * Returns the available menu items for Titan Emails
 *
 * @param {Object} titanMenuParams The argument for this function.
 * @param {string} titanMenuParams.email The email address of the Titan account
 * @param {Function} titanMenuParams.translate The translate function
 * @returns Array of menu items
 */
const getTitanMenuItems = ( { email, translate } ) => {
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

/**
 * Get the list of applicable menu items for a G Suite or Google Workspace mailbox.
 *
 * @param {Object} gSuiteMenuParams Parameter for this function.
 * @param {Object} gSuiteMenuParams.account The account the current mailbox is linked to.
 * @param {string} gSuiteMenuParams.email The full email address for the current mailbox.
 * @param {Object} gSuiteMenuParams.mailbox The mailbox object.
 * @param {Function} gSuiteMenuParams.translate The translate function.
 * @returns {Array|null} Returns an array of menu items or null if no items should be shown.
 */
const getGSuiteMenuItems = ( { account, email, mailbox, translate } ) => {
	if ( hasGoogleAccountTOSWarning( account ) ) {
		return null;
	}

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

const getEmailForwardMenuItems = ( { dispatch, mailbox, translate } ) => {
	return [
		{
			isInternalLink: true,
			materialIcon: 'delete',
			onClick: () => {
				removeEmailForwardMailbox( { dispatch, mailbox } );
			},
			key: `remove_forward:${ mailbox.mailbox }`,
			title: translate( 'Remove email forward', {
				comment: 'Remove an email forward',
			} ),
		},
	];
};

const EmailMailboxActionMenu = ( { account, domain, mailbox } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const email = `${ mailbox.mailbox }@${ mailbox.domain }`;

	const getMenuItems = () => {
		if ( hasTitanMailWithUs( domain ) ) {
			return getTitanMenuItems( { email, translate } );
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return getGSuiteMenuItems( { account, email, mailbox, translate } );
		}

		if ( hasEmailForwards( domain ) ) {
			return getEmailForwardMenuItems( {
				dispatch,
				mailbox,
				translate,
			} );
		}

		return null;
	};

	const menuItems = getMenuItems();

	if ( ! menuItems ) {
		return null;
	}

	return (
		<EllipsisMenu position="bottom" className="email-mailbox-action-menu__main">
			{ menuItems.map(
				( {
					href,
					image,
					imageAltText,
					isInternalLink = false,
					key,
					materialIcon,
					onClick,
					title,
				} ) => (
					<PopoverMenuItem
						key={ href || key }
						className="email-mailbox-action-menu__menu-item"
						isExternalLink={ ! isInternalLink }
						href={ href }
						onClick={ onClick }
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

EmailMailboxActionMenu.propTypes = {
	account: PropTypes.object.isRequired,
	domain: PropTypes.object.isRequired,
	mailbox: PropTypes.object.isRequired,
};

export default EmailMailboxActionMenu;
