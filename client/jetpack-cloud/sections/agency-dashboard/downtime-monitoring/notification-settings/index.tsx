import { isEnabled } from '@automattic/calypso-config';
import { Modal } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState, useContext } from 'react';
import AlertBanner from 'calypso/components/jetpack/alert-banner';
import {
	useUpdateMonitorSettings,
	useJetpackAgencyDashboardRecordTrackEvent,
	useShowVerifiedBadge,
} from '../../hooks';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import {
	availableNotificationDurations as durations,
	getSiteCountText,
} from '../../sites-overview/utils';
import EmailAddressEditor from '../configure-email-notification/email-address-editor';
import PhoneNumberEditor from '../configure-sms-notification/phone-number-editor';
import EmailNotification from './form-content/email-notification';
import NotificationSettingsFormFooter from './form-content/footer';
import MobilePushNotification from './form-content/mobile-push-notification';
import NotificationDuration from './form-content/notification-duration';
import SMSNotification from './form-content/sms-notification';
import type {
	MonitorSettings,
	Site,
	StateMonitorSettingsEmail,
	AllowedMonitorContactActions,
	MonitorSettingsEmail,
	UpdateMonitorSettingsParams,
	MonitorDuration,
	InitialMonitorSettings,
} from '../../sites-overview/types';

import './style.scss';
import '../style.scss';

interface Props {
	sites: Array< Site >;
	onClose: () => void;
	settings?: MonitorSettings;
	bulkUpdateSettings?: MonitorSettings;
	isLargeScreen?: boolean;
}

export default function NotificationSettings( {
	onClose,
	sites,
	settings,
	bulkUpdateSettings,
	isLargeScreen,
}: Props ) {
	const isBulkUpdate = !! bulkUpdateSettings;
	const translate = useTranslate();

	const { updateMonitorSettings, isLoading, isComplete } = useUpdateMonitorSettings( sites );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( sites, isLargeScreen );
	const { verifiedItem, handleSetVerifiedItem } = useShowVerifiedBadge();

	const { verifiedContacts } = useContext( DashboardDataContext );

	const defaultDuration = durations.find( ( duration ) => duration.time === 5 );

	const [ enableSMSNotification, setEnableSMSNotification ] = useState< boolean >( false );
	const [ enableMobileNotification, setEnableMobileNotification ] = useState< boolean >( false );
	const [ enableEmailNotification, setEnableEmailNotification ] = useState< boolean >( false );
	const [ selectedDuration, setSelectedDuration ] = useState< MonitorDuration | undefined >(
		defaultDuration
	);
	const [ defaultUserEmailAddresses, setDefaultUserEmailAddresses ] = useState< string[] | [] >(
		[]
	);
	const [ allEmailItems, setAllEmailItems ] = useState< StateMonitorSettingsEmail[] | [] >( [] );
	const [ validationError, setValidationError ] = useState< string >( '' );
	const [ isAddEmailModalOpen, setIsAddEmailModalOpen ] = useState< boolean >( false );
	const [ isAddSMSModalOpen, setIsAddSMSModalOpen ] = useState< boolean >( false );
	const [ selectedEmail, setSelectedEmail ] = useState< StateMonitorSettingsEmail | undefined >();
	const [ selectedAction, setSelectedAction ] = useState< AllowedMonitorContactActions >();
	const [ initialSettings, setInitialSettings ] = useState< InitialMonitorSettings >( {
		enableEmailNotification: false,
		enableMobileNotification: false,
		selectedDuration: defaultDuration,
		emailContacts: [],
	} );
	const [ hasUnsavedChanges, setHasUnsavedChanges ] = useState< boolean >( false );

	const isMultipleEmailEnabled: boolean = isEnabled(
		'jetpack/pro-dashboard-monitor-multiple-email-recipients'
	);

	const isSMSNotificationEnabled: boolean = isEnabled(
		'jetpack/pro-dashboard-monitor-sms-notification'
	);

	const mapAndStringifyEmails = ( emails: MonitorSettingsEmail[] ) => {
		return JSON.stringify( emails.map( ( { name, email } ) => ( { name, email } ) ) );
	};

	const unsavedChangesExist =
		enableMobileNotification !== initialSettings.enableMobileNotification ||
		enableEmailNotification !== initialSettings.enableEmailNotification ||
		selectedDuration?.time !== initialSettings.selectedDuration?.time ||
		( isMultipleEmailEnabled &&
			mapAndStringifyEmails( allEmailItems ) !==
				mapAndStringifyEmails( initialSettings?.emailContacts ?? [] ) );

	// Check if any unsaved changes are present and prompt user to confirm before closing the modal.
	const handleOnClose = useCallback( () => {
		if ( hasUnsavedChanges || ! unsavedChangesExist ) {
			return onClose();
		}
		return setHasUnsavedChanges( true );
	}, [ hasUnsavedChanges, onClose, unsavedChangesExist ] );

	const toggleAddEmailModal = (
		item?: StateMonitorSettingsEmail,
		action?: AllowedMonitorContactActions
	) => {
		if ( item && action ) {
			setSelectedEmail( item );
			setSelectedAction( action );
		}
		setIsAddEmailModalOpen( ( isAddEmailModalOpen ) => ! isAddEmailModalOpen );
		if ( isAddEmailModalOpen ) {
			setSelectedEmail( undefined );
			setSelectedAction( undefined );
		}
	};

	const toggleAddSMSModal = () => {
		setIsAddSMSModalOpen( ( isAddSMSModalOpen ) => ! isAddSMSModalOpen );
	};

	const handleSetAllEmailItems = ( items: StateMonitorSettingsEmail[] ) => {
		setAllEmailItems( items );
		setHasUnsavedChanges( false );
	};

	function onSave( event: React.FormEvent< HTMLFormElement > ) {
		event.preventDefault();

		if ( ! enableMobileNotification && ! enableEmailNotification ) {
			return setValidationError( translate( 'Please select at least one contact method.' ) );
		}
		const params = {
			wp_note_notifications: enableMobileNotification,
			email_notifications: enableEmailNotification,
			jetmon_defer_status_down_minutes: selectedDuration?.time,
		} as UpdateMonitorSettingsParams;

		const eventParams = { ...params } as any; // Adding eventParams since parameters for tracking events should be flat, not nested.

		if ( isMultipleEmailEnabled ) {
			const extraEmails = allEmailItems.filter( ( item ) => ! item.isDefault );
			params.contacts = {
				emails: extraEmails.map( ( item ) => {
					const isVerified = item.verified || verifiedContacts.emails.includes( item.email );
					return {
						name: item.name,
						email_address: item.email,
						verified: isVerified,
					};
				} ),
			};
			eventParams.email_contacts = params.contacts.emails.length;
		}
		recordEvent( 'notification_save_click', eventParams );
		updateMonitorSettings( params );
	}

	function selectDuration( duration: MonitorDuration ) {
		recordEvent( 'duration_select', { duration: duration.time } );
		setSelectedDuration( duration );
		setHasUnsavedChanges( false );
	}

	const getAllEmailItems = useCallback(
		( settings: MonitorSettings ) => {
			const userEmailItems =
				settings.monitor_user_emails.map( ( email ) => ( {
					email,
					name: translate( 'Default account email' ),
					isDefault: true,
					verified: true,
				} ) ) ?? [];
			let siteEmailItems: Array< MonitorSettingsEmail > = [];

			// If it is bulk update, we should not show the site email addresses.
			if ( ! isBulkUpdate && settings.monitor_notify_additional_user_emails ) {
				siteEmailItems = settings.monitor_notify_additional_user_emails.map( ( item ) => ( {
					email: item.email_address,
					name: item.name,
					verified: item.verified,
				} ) );
			}

			return [ ...userEmailItems, ...siteEmailItems ];
		},
		[ isBulkUpdate, translate ]
	);

	const handleSetEmailItems = useCallback(
		( settings: MonitorSettings ) => {
			const userEmails = settings.monitor_user_emails || [];
			setDefaultUserEmailAddresses( userEmails );

			if ( isMultipleEmailEnabled ) {
				const allEmailItems = getAllEmailItems( settings );
				setAllEmailItems( allEmailItems );
			}
		},
		[ getAllEmailItems, isMultipleEmailEnabled ]
	);

	const setInitialMonitorSettings = useCallback(
		( settings: MonitorSettings ) => {
			// Set all email items
			handleSetEmailItems( settings );

			// Set email and mobile notification settings
			const isEmailEnabled = !! settings.monitor_user_email_notifications;
			const isMobileEnabled = !! settings.monitor_user_wp_note_notifications;
			setEnableEmailNotification( isEmailEnabled );
			setEnableMobileNotification( isMobileEnabled );

			// Set duration
			let foundDuration = defaultDuration;
			if ( settings?.monitor_deferment_time ) {
				foundDuration = durations.find(
					( duration ) => duration.time === settings.monitor_deferment_time
				);
				setSelectedDuration( foundDuration );
			}

			// Set initial settings
			setInitialSettings( {
				enableEmailNotification: isEmailEnabled,
				enableMobileNotification: isMobileEnabled,
				selectedDuration: foundDuration,
				...( isMultipleEmailEnabled && { emailContacts: getAllEmailItems( settings ) } ),
			} );
		},
		[ defaultDuration, getAllEmailItems, handleSetEmailItems, isMultipleEmailEnabled ]
	);

	useEffect( () => {
		if ( settings ) {
			setInitialMonitorSettings( settings );
		}
	}, [ setInitialMonitorSettings, settings ] );

	const setBulkUpdateSettings = useCallback(
		( settings: MonitorSettings ) => {
			// Set all email items
			handleSetEmailItems( settings );

			// Set initial settings
			setInitialSettings( {
				enableEmailNotification: false,
				enableMobileNotification: false,
				selectedDuration: defaultDuration,
				...( isMultipleEmailEnabled && { emailContacts: getAllEmailItems( settings ) } ),
			} );
		},
		[ defaultDuration, getAllEmailItems, handleSetEmailItems, isMultipleEmailEnabled ]
	);

	useEffect( () => {
		if ( bulkUpdateSettings ) {
			setBulkUpdateSettings( bulkUpdateSettings );
		}
	}, [ bulkUpdateSettings, setBulkUpdateSettings ] );

	useEffect( () => {
		if ( enableMobileNotification || enableEmailNotification ) {
			setValidationError( '' );
			setHasUnsavedChanges( false );
		}
	}, [ enableMobileNotification, enableEmailNotification ] );

	useEffect( () => {
		if ( isComplete ) {
			onClose();
		}
	}, [ isComplete, onClose ] );

	if ( isAddEmailModalOpen ) {
		return (
			<EmailAddressEditor
				toggleModal={ toggleAddEmailModal }
				selectedEmail={ selectedEmail }
				selectedAction={ selectedAction }
				allEmailItems={ allEmailItems }
				setAllEmailItems={ handleSetAllEmailItems }
				recordEvent={ recordEvent }
				setVerifiedEmail={ ( item ) => handleSetVerifiedItem( 'email', item ) }
				sites={ sites }
			/>
		);
	}

	if ( isAddSMSModalOpen ) {
		return <PhoneNumberEditor toggleModal={ toggleAddSMSModal } />;
	}

	return (
		<Modal
			open={ true }
			onRequestClose={ handleOnClose }
			title={ translate( 'Set custom notification' ) }
			className="notification-settings__modal"
		>
			<div className="notification-settings__sub-title">{ getSiteCountText( sites ) }</div>
			<form onSubmit={ onSave }>
				{ isBulkUpdate && (
					<AlertBanner type="warning">
						{ translate( 'Settings for selected sites will be overwritten.' ) }
					</AlertBanner>
				) }
				<div className={ classNames( { 'notification-settings__content': ! isBulkUpdate } ) }>
					<NotificationDuration
						recordEvent={ recordEvent }
						selectedDuration={ selectedDuration }
						selectDuration={ selectDuration }
					/>
					{ isSMSNotificationEnabled && (
						<SMSNotification
							enableSMSNotification={ enableSMSNotification }
							setEnableSMSNotification={ setEnableSMSNotification }
							toggleModal={ toggleAddSMSModal }
						/>
					) }

					<MobilePushNotification
						recordEvent={ recordEvent }
						enableMobileNotification={ enableMobileNotification }
						setEnableMobileNotification={ setEnableMobileNotification }
					/>
					<EmailNotification
						recordEvent={ recordEvent }
						verifiedItem={ verifiedItem }
						enableEmailNotification={ enableEmailNotification }
						setEnableEmailNotification={ setEnableEmailNotification }
						defaultUserEmailAddresses={ defaultUserEmailAddresses }
						toggleAddEmailModal={ toggleAddEmailModal }
						allEmailItems={ allEmailItems }
					/>
				</div>
				<NotificationSettingsFormFooter
					isLoading={ isLoading }
					validationError={ validationError }
					isBulkUpdate={ isBulkUpdate }
					handleOnClose={ handleOnClose }
					hasUnsavedChanges={ hasUnsavedChanges }
					unsavedChangesExist={ unsavedChangesExist }
				/>
			</form>
		</Modal>
	);
}
