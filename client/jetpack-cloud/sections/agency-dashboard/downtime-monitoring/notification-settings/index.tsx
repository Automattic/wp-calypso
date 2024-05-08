import { isEnabled } from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState, useContext } from 'react';
import AlertBanner from 'calypso/components/jetpack/alert-banner';
import { DEFAULT_DOWNTIME_MONITORING_DURATION } from '../../constants';
import DashboardModalForm from '../../dashboard-modal-form';
import { useUpdateMonitorSettings, useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import useNotificationDurations from '../../sites-overview/hooks/use-notification-durations';
import useSiteCountText from '../../sites-overview/hooks/use-site-count-text';
import ContactEditor from '../contact-editor';
import { RestrictionType } from '../types';
import EmailNotification from './form-content/email-notification';
import NotificationSettingsFormFooter from './form-content/footer';
import MobilePushNotification from './form-content/mobile-push-notification';
import NotificationDuration from './form-content/notification-duration';
import SMSNotification from './form-content/sms-notification';
import useShowVerifiedBadge from './use-show-verified-badge';
import type {
	MonitorSettings,
	Site,
	StateMonitorSettingsEmail,
	AllowedMonitorContactActions,
	MonitorSettingsEmail,
	UpdateMonitorSettingsParams,
	MonitorDuration,
	InitialMonitorSettings,
	StateMonitorSettingsSMS,
	MonitorSettingsContact,
	StateMonitoringSettingsContact,
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
	const siteCountText = useSiteCountText( sites );

	const { verifiedContacts } = useContext( DashboardDataContext );

	const durations = useNotificationDurations();
	const defaultDuration = durations.find(
		( duration ) => duration.time === DEFAULT_DOWNTIME_MONITORING_DURATION
	);

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
	const [ allPhoneItems, setAllPhoneItems ] = useState< StateMonitorSettingsSMS[] | [] >( [] );
	const [ validationError, setValidationError ] = useState< string >( '' );
	const [ isAddEmailModalOpen, setIsAddEmailModalOpen ] = useState< boolean >( false );
	const [ isAddSMSModalOpen, setIsAddSMSModalOpen ] = useState< boolean >( false );
	const [ selectedEmail, setSelectedEmail ] = useState< StateMonitorSettingsEmail | undefined >();
	const [ selectedPhone, setSelectedPhone ] = useState< StateMonitorSettingsSMS | undefined >();
	const [ selectedAction, setSelectedAction ] = useState< AllowedMonitorContactActions >();
	const [ initialSettings, setInitialSettings ] = useState< InitialMonitorSettings >( {
		enableSMSNotification: false,
		enableEmailNotification: false,
		enableMobileNotification: false,
		selectedDuration: defaultDuration,
		emailContacts: [],
		phoneContacts: [],
	} );
	const [ hasUnsavedChanges, setHasUnsavedChanges ] = useState< boolean >( false );

	const { updateMonitorSettings, isLoading, isComplete } = useUpdateMonitorSettings(
		sites,
		selectedDuration?.time
	);
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( sites, isLargeScreen );
	const { verifiedItem, handleSetVerifiedItem } = useShowVerifiedBadge();

	const isMultipleEmailEnabled: boolean = isEnabled(
		'jetpack/pro-dashboard-monitor-multiple-email-recipients'
	);

	const isSMSNotificationEnabled: boolean = isEnabled(
		'jetpack/pro-dashboard-monitor-sms-notification'
	);

	const isPaidTierEnabled = isEnabled( 'jetpack/pro-dashboard-monitor-paid-tier' );

	// Check if current site or all sites selected has a paid license.
	const hasPaidLicenses = ! sites.find( ( site ) => ! site.has_paid_agency_monitor );

	let restriction: RestrictionType = 'none';

	if ( ! hasPaidLicenses ) {
		// We need to set the restriction type to determine correct messaging.
		restriction = isBulkUpdate ? 'free_site_selected' : 'upgrade_required';
	}

	const isContactListMatch = (
		list1: ReadonlyArray< MonitorSettingsContact >,
		list2: ReadonlyArray< MonitorSettingsContact >
	): boolean => {
		const stringifyContacts = ( list: ReadonlyArray< MonitorSettingsContact > ): string => {
			return JSON.stringify(
				list.map( ( item: MonitorSettingsContact ) => {
					const property = (
						'email' in item ? 'email' : 'phoneNumberFull'
					) as keyof MonitorSettingsContact;
					return {
						name: item.name,
						[ property ]: item[ property ],
					};
				} )
			);
		};

		return stringifyContacts( list1 ) === stringifyContacts( list2 );
	};

	const unsavedChangesExist =
		enableSMSNotification !== initialSettings.enableSMSNotification ||
		enableMobileNotification !== initialSettings.enableMobileNotification ||
		enableEmailNotification !== initialSettings.enableEmailNotification ||
		selectedDuration?.time !== initialSettings.selectedDuration?.time ||
		( isMultipleEmailEnabled &&
			! isContactListMatch( allEmailItems, initialSettings?.emailContacts ?? [] ) ) ||
		( isSMSNotificationEnabled &&
			! isContactListMatch( allPhoneItems, initialSettings?.phoneContacts ?? [] ) );

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

	const toggleAddSMSModal = (
		item?: StateMonitorSettingsSMS,
		action?: AllowedMonitorContactActions
	) => {
		if ( item && action ) {
			setSelectedPhone( item );
			setSelectedAction( action );
		}
		setIsAddSMSModalOpen( ( isAddSMSModalOpen ) => ! isAddSMSModalOpen );
		if ( isAddSMSModalOpen ) {
			setSelectedPhone( undefined );
			setSelectedAction( undefined );
		}
	};

	const clearValidationError = useCallback( () => {
		setValidationError( '' );
		setHasUnsavedChanges( false );
	}, [] );

	const handleSetAllEmailItems = ( items: StateMonitoringSettingsContact[] ) => {
		setAllEmailItems( items as StateMonitorSettingsEmail[] );
		setHasUnsavedChanges( false );
	};

	const handleSetAllPhoneItems = ( items: StateMonitoringSettingsContact[] ) => {
		setAllPhoneItems( items as StateMonitorSettingsSMS[] );
		clearValidationError();
	};

	function onSave() {
		if (
			! enableMobileNotification &&
			! enableEmailNotification &&
			! ( isSMSNotificationEnabled && enableSMSNotification )
		) {
			return setValidationError( translate( 'Please select at least one contact method.' ) );
		}

		if ( isSMSNotificationEnabled && enableSMSNotification && ! allPhoneItems.length ) {
			return setValidationError( translate( 'Please add at least one phone number.' ) );
		}

		const params = {
			wp_note_notifications: enableMobileNotification,
			email_notifications: enableEmailNotification,
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
			eventParams.email_contacts = params.contacts.emails?.length;
		}
		if ( isSMSNotificationEnabled ) {
			params.sms_notifications = enableSMSNotification;
			params.contacts = {
				...( params.contacts?.emails ? params.contacts : {} ),
				sms_numbers: allPhoneItems.map( ( item ) => {
					const isVerified =
						item.verified || verifiedContacts.phoneNumbers.includes( item.phoneNumberFull );
					return {
						name: item.name,
						sms_number: item.phoneNumberFull,
						number: item.phoneNumber,
						country_code: item.countryCode,
						country_numeric_code: item.countryNumericCode,
						verified: isVerified,
					};
				} ),
			};
			eventParams.sms_contacts = params.contacts.sms_numbers?.length;
			eventParams.sms_notifications = params.sms_notifications;
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

	const getAllPhoneItems = useCallback(
		( settings: MonitorSettings ) => {
			let sitePhoneItems: Array< StateMonitorSettingsSMS > = [];

			// If it is bulk update, we should not show the site phone numbers.
			if ( ! isBulkUpdate && settings.monitor_notify_additional_user_sms ) {
				sitePhoneItems = settings.monitor_notify_additional_user_sms.map( ( item ) => ( {
					name: item.name,
					countryCode: item.country_code,
					countryNumericCode: item.country_numeric_code,
					phoneNumber: item.number,
					phoneNumberFull: item.sms_number,
					verified: item.verified,
				} ) );
			}
			return sitePhoneItems;
		},
		[ isBulkUpdate ]
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

	const handleSetPhoneItems = useCallback(
		( settings: MonitorSettings ) => {
			if ( isSMSNotificationEnabled ) {
				const allPhoneItems = getAllPhoneItems( settings );
				setAllPhoneItems( allPhoneItems );
			}
		},
		[ getAllPhoneItems, isSMSNotificationEnabled ]
	);

	const setInitialMonitorSettings = useCallback(
		( settings: MonitorSettings ) => {
			// Set all email and phone items
			handleSetEmailItems( settings );
			handleSetPhoneItems( settings );
			// Set SMS, email and mobile notification settings
			const isSMSEnabled = !! settings.monitor_user_sms_notifications;
			const isEmailEnabled = !! settings.monitor_user_email_notifications;
			const isMobileEnabled = !! settings.monitor_user_wp_note_notifications;
			setEnableSMSNotification( isSMSEnabled );
			setEnableEmailNotification( isEmailEnabled );
			setEnableMobileNotification( isMobileEnabled );

			// Set duration
			let foundDuration = defaultDuration;
			if ( settings?.check_interval ) {
				foundDuration = durations.find( ( duration ) => duration.time === settings.check_interval );

				// We need to make sure that we are not setting a paid duration if there is no license.
				if ( hasPaidLicenses || ! foundDuration?.isPaid ) {
					setSelectedDuration( foundDuration );
				}
			}

			// Set initial settings
			setInitialSettings( {
				enableSMSNotification: isSMSEnabled,
				enableEmailNotification: isEmailEnabled,
				enableMobileNotification: isMobileEnabled,
				selectedDuration: foundDuration,
				...( isMultipleEmailEnabled && { emailContacts: getAllEmailItems( settings ) } ),
				...( isSMSNotificationEnabled && { phoneContacts: getAllPhoneItems( settings ) } ),
			} );
		},
		[
			defaultDuration,
			durations,
			getAllEmailItems,
			getAllPhoneItems,
			handleSetEmailItems,
			handleSetPhoneItems,
			hasPaidLicenses,
			isMultipleEmailEnabled,
			isSMSNotificationEnabled,
		]
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
				enableSMSNotification: false,
				enableEmailNotification: false,
				enableMobileNotification: false,
				selectedDuration: defaultDuration,
				...( isMultipleEmailEnabled && { emailContacts: getAllEmailItems( settings ) } ),
				...( isSMSNotificationEnabled && { phoneContacts: getAllPhoneItems( settings ) } ),
			} );
		},
		[
			defaultDuration,
			getAllEmailItems,
			getAllPhoneItems,
			handleSetEmailItems,
			isMultipleEmailEnabled,
			isSMSNotificationEnabled,
		]
	);

	useEffect( () => {
		if ( bulkUpdateSettings ) {
			setBulkUpdateSettings( bulkUpdateSettings );
		}
	}, [ bulkUpdateSettings, setBulkUpdateSettings ] );

	useEffect( () => {
		if ( enableMobileNotification || enableEmailNotification || enableSMSNotification ) {
			clearValidationError();
		}
	}, [
		enableMobileNotification,
		enableEmailNotification,
		enableSMSNotification,
		clearValidationError,
	] );

	useEffect( () => {
		if ( isComplete ) {
			onClose();
		}
	}, [ isComplete, onClose ] );

	if ( isAddEmailModalOpen ) {
		return (
			<ContactEditor
				type="email"
				onClose={ toggleAddEmailModal }
				selectedContact={ selectedEmail }
				action={ selectedAction }
				contacts={ allEmailItems }
				setContacts={ handleSetAllEmailItems }
				recordEvent={ recordEvent }
				setVerifiedContact={ ( item ) => handleSetVerifiedItem( 'email', item ) }
				sites={ sites }
			/>
		);
	}

	if ( isAddSMSModalOpen ) {
		return (
			<ContactEditor
				type="sms"
				onClose={ toggleAddSMSModal }
				selectedContact={ selectedPhone }
				action={ selectedAction }
				contacts={ allPhoneItems }
				setContacts={ handleSetAllPhoneItems }
				recordEvent={ recordEvent }
				setVerifiedContact={ ( item ) => handleSetVerifiedItem( 'phone', item ) }
				sites={ sites }
			/>
		);
	}

	return (
		<DashboardModalForm
			className="notification-settings"
			title={ translate( 'Set custom notification' ) }
			subtitle={ siteCountText }
			onClose={ handleOnClose }
			onSubmit={ onSave }
		>
			{ isBulkUpdate && (
				<AlertBanner type="warning">
					{ translate( 'Settings for selected sites will be overwritten.' ) }
				</AlertBanner>
			) }
			<div className={ clsx( { 'notification-settings__content': ! isBulkUpdate } ) }>
				<NotificationDuration
					recordEvent={ recordEvent }
					selectedDuration={ selectedDuration }
					selectDuration={ selectDuration }
					restriction={ restriction }
				/>

				{ isPaidTierEnabled && (
					<SMSNotification
						recordEvent={ recordEvent }
						enableSMSNotification={ enableSMSNotification }
						setEnableSMSNotification={ setEnableSMSNotification }
						toggleModal={ toggleAddSMSModal }
						allPhoneItems={ allPhoneItems }
						verifiedItem={ verifiedItem }
						restriction={ restriction }
						settings={ settings }
					/>
				) }

				<EmailNotification
					recordEvent={ recordEvent }
					verifiedItem={ verifiedItem }
					enableEmailNotification={ enableEmailNotification }
					setEnableEmailNotification={ setEnableEmailNotification }
					defaultUserEmailAddresses={ defaultUserEmailAddresses }
					toggleAddEmailModal={ toggleAddEmailModal }
					allEmailItems={ allEmailItems }
					restriction={ restriction }
				/>

				<MobilePushNotification
					recordEvent={ recordEvent }
					enableMobileNotification={ enableMobileNotification }
					setEnableMobileNotification={ setEnableMobileNotification }
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
		</DashboardModalForm>
	);
}
