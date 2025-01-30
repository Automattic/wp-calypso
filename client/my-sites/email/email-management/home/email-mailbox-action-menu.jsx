import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog, MaterialIcon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import googleAdminIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/admin.svg';
import googleCalendarIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/calendar.svg';
import googleDocsIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/docs.svg';
import googleDriveIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/drive.svg';
import gmailIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/gmail.svg';
import googleSheetsIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/sheets.svg';
import googleSlidesIcon from 'calypso/assets/images/email-providers/google-workspace/services/flat/slides.svg';
import titanMailIcon from 'calypso/assets/images/email-providers/titan/services/flat/mail.svg';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useRemoveTitanMailboxMutation } from 'calypso/data/emails/use-remove-titan-mailbox-mutation';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { getEmailAddress, hasGoogleAccountTOSWarning, isEmailUserAdmin } from 'calypso/lib/emails';
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
import { getTitanEmailUrl, hasTitanMailWithUs, useTitanAppsUrlPrefix } from 'calypso/lib/titan';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const getGoogleClickHandler = ( app ) => {
	return () => {
		recordEmailAppLaunchEvent( {
			app,
			context: 'email-management-menu',
			provider: 'google',
		} );
	};
};

const getTitanClickHandler = ( app ) => {
	return () => {
		recordEmailAppLaunchEvent( {
			app,
			context: 'email-management-menu',
			provider: 'titan',
		} );
	};
};

/**
 * Returns the available menu items for Titan Emails
 * @param {Object} titanMenuParams The argument for this function.
 * @param {import('calypso/lib/domains/types').ResponseDomain} titanMenuParams.domain The domain object.
 * @param {Object} titanMenuParams.mailbox The mailbox object.
 * @param {Function} titanMenuParams.showRemoveMailboxDialog The function that removes modal dialogs for confirming mailbox removals
 * @param {string} titanMenuParams.titanAppsUrlPrefix The URL prefix for Titan Apps
 * @param {Function} titanMenuParams.translate The translate function.
 * @returns Array of menu items
 */
const getTitanMenuItems = ( {
	domain,
	mailbox,
	showRemoveMailboxDialog,
	titanAppsUrlPrefix,
	translate,
} ) => {
	const email = getEmailAddress( mailbox );

	return [
		{
			href: getTitanEmailUrl( titanAppsUrlPrefix, email, false, window.location.href ),
			image: titanMailIcon,
			imageAltText: translate( 'Titan Mail icon' ),
			title: translate( 'View Mail', {
				comment: 'View the Email application (i.e. the webmail) for Titan',
			} ),
			onClick: getTitanClickHandler( 'webmail' ),
		},
		{
			isInternalLink: true,
			materialIcon: 'delete',
			disabled: ! canCurrentUserAddEmail( domain ),
			onClick: () => {
				showRemoveMailboxDialog?.();

				recordTracksEvent( 'calypso_email_management_titan_remove_mailbox_click', {
					domain_name: mailbox.domain,
					mailbox: mailbox.mailbox,
				} );
			},
			key: `remove_mailbox:${ mailbox.mailbox }`,
			title: translate( 'Remove mailbox' ),
		},
	];
};

/**
 * Get the list of applicable menu items for a G Suite or Google Workspace mailbox.
 * @param {Object} gSuiteMenuParams Parameter for this function.
 * @param {Object} gSuiteMenuParams.account The account the current mailbox is linked to.
 * @param {Object} gSuiteMenuParams.mailbox The mailbox object.
 * @param {Function} gSuiteMenuParams.translate The translate function.
 * @returns {Array|null} Returns an array of menu items or null if no items should be shown.
 */
const getGSuiteMenuItems = ( { account, mailbox, translate } ) => {
	if ( hasGoogleAccountTOSWarning( account ) ) {
		return null;
	}

	const email = getEmailAddress( mailbox );

	return [
		{
			href: getGmailUrl( email ),
			image: gmailIcon,
			imageAltText: translate( 'Gmail icon' ),
			title: translate( 'View Gmail' ),
			onClick: getGoogleClickHandler( 'webmail' ),
		},
		...( isEmailUserAdmin( mailbox )
			? [
					{
						href: getGoogleAdminUrl( email ),
						image: googleAdminIcon,
						imageAltText: translate( 'Google Admin icon' ),
						title: translate( 'View Admin' ),
						onClick: getGoogleClickHandler( 'admin' ),
					},
			  ]
			: [] ),
		{
			href: getGoogleCalendarUrl( email ),
			image: googleCalendarIcon,
			imageAltText: translate( 'Google Calendar icon' ),
			title: translate( 'View Calendar' ),
			onClick: getGoogleClickHandler( 'calendar' ),
		},
		{
			href: getGoogleDocsUrl( email ),
			image: googleDocsIcon,
			imageAltText: translate( 'Google Docs icon' ),
			title: translate( 'View Docs' ),
			onClick: getGoogleClickHandler( 'docs' ),
		},
		{
			href: getGoogleDriveUrl( email ),
			image: googleDriveIcon,
			imageAltText: translate( 'Google Drive icon' ),
			title: translate( 'View Drive' ),
			onClick: getGoogleClickHandler( 'drive' ),
		},
		{
			href: getGoogleSheetsUrl( email ),
			image: googleSheetsIcon,
			imageAltText: translate( 'Google Sheets icon' ),
			title: translate( 'View Sheets' ),
			onClick: getGoogleClickHandler( 'sheets' ),
		},
		{
			href: getGoogleSlidesUrl( email ),
			image: googleSlidesIcon,
			imageAltText: translate( 'Google Slides icon' ),
			title: translate( 'View Slides' ),
			onClick: getGoogleClickHandler( 'slides' ),
		},
	];
};

const RemoveTitanMailboxConfirmationDialog = ( { mailbox, visible, setVisible } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const emailAddress = getEmailAddress( mailbox );

	const noticeDuration = 7000;

	const errorMessage = errorNotice(
		translate(
			'There was an error removing {{strong}}%(emailAddress)s{{/strong}} from your account',
			{
				comment: '%(emailAddress)s is the email address for the mailbox being deleted',
				args: { emailAddress },
				components: {
					strong: <strong />,
				},
			}
		),
		{ duration: noticeDuration }
	);

	// The mailboxes are not removed immediately, but rather scheduled. An async job takes care of the deletion. Then
	// we also wait for the deletion event to come through from Titan since we really only read the local tables.
	const successMessage = successNotice(
		translate(
			'{{strong}}%(emailAddress)s{{/strong}} has been scheduled for removal from your account',
			{
				comment: '%(emailAddress)s is the email address for the mailbox being deleted',
				args: { emailAddress },
				components: {
					strong: <strong />,
				},
			}
		),
		{ duration: noticeDuration }
	);

	const { mutate: removeTitanMailbox } = useRemoveTitanMailboxMutation(
		mailbox.domain,
		mailbox.mailbox,
		{
			onSettled: ( data ) => {
				if ( data?.status === 202 ) {
					dispatch( successMessage );
					return;
				}
				dispatch( errorMessage );
			},
		}
	);

	const onClose = ( action ) => {
		setVisible( false );

		if ( 'remove' === action ) {
			removeTitanMailbox();

			recordTracksEvent( 'calypso_email_management_titan_remove_mailbox_execute', {
				domain_name: mailbox.domain,
				mailbox: mailbox.mailbox,
			} );
		}
	};

	const buttons = [
		{ action: 'cancel', label: translate( 'Cancel' ) },
		{ action: 'remove', label: translate( 'Confirm' ), isPrimary: true },
	];

	return (
		<Dialog
			className="email-mailbox-action-menu__remove-titan-mailbox-dialog"
			isVisible={ visible }
			buttons={ buttons }
			onClose={ onClose }
		>
			<div>
				<h3> { translate( 'Remove mailbox' ) } </h3>
				<p>
					{ translate(
						'Are you sure you want to remove {{strong}}%(emailAddress)s{{/strong}}? All your emails, calendar events, and contacts will be deleted!',
						{
							comment: '%(emailAddress)s is the email address for the mailbox being deleted',
							args: { emailAddress },
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>
			</div>
		</Dialog>
	);
};

RemoveTitanMailboxConfirmationDialog.propTypes = {
	mailbox: PropTypes.object.isRequired,
	visible: PropTypes.bool.isRequired,
	setVisible: PropTypes.func.isRequired,
};

const EmailMailboxActionMenu = ( { account, domain, mailbox } ) => {
	const translate = useTranslate();
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();

	const [ removeTitanMailboxDialogVisible, setRemoveTitanMailboxDialogVisible ] = useState( false );
	const domainHasTitanMailWithUs = hasTitanMailWithUs( domain );

	const getMenuItems = () => {
		if ( domainHasTitanMailWithUs ) {
			return getTitanMenuItems( {
				domain,
				mailbox,
				showRemoveMailboxDialog: () => setRemoveTitanMailboxDialogVisible( true ),
				titanAppsUrlPrefix,
				translate,
			} );
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return getGSuiteMenuItems( { account, mailbox, translate } );
		}

		return null;
	};

	const menuItems = getMenuItems();

	if ( ! menuItems ) {
		return null;
	}

	return (
		<>
			{ domainHasTitanMailWithUs && (
				<RemoveTitanMailboxConfirmationDialog
					mailbox={ mailbox }
					setVisible={ setRemoveTitanMailboxDialogVisible }
					visible={ removeTitanMailboxDialogVisible }
				/>
			) }
			<EllipsisMenu position="bottom left" className="email-mailbox-action-menu__main">
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
						disabled,
					} ) => (
						<PopoverMenuItem
							key={ href || key }
							className="email-mailbox-action-menu__menu-item"
							isExternalLink={ ! isInternalLink }
							disabled={ disabled }
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
		</>
	);
};

EmailMailboxActionMenu.propTypes = {
	account: PropTypes.object.isRequired,
	domain: PropTypes.object.isRequired,
	mailbox: PropTypes.object.isRequired,
};

export default EmailMailboxActionMenu;
