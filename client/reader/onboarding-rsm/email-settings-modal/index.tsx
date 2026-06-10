import { updateUserSettings, type UserSettings } from '@automattic/api-core';
import { userSettingsQuery } from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	applyDeliveryWindowEdit,
	getDeliveryHourPickerHours,
	getDisplayDeliveryWindow,
	useDeliveryWindowTimezone,
} from '@automattic/i18n-utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Notice,
	SelectControl,
	Spinner,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import React, { useEffect, useRef, useState } from 'react';
import { READER_ONBOARDING_TRACKS_EVENT_PREFIX } from 'calypso/reader/onboarding-rsm/constants';
import { StepIndicator } from 'calypso/reader/onboarding-rsm/step-indicator';

import './style.scss';

// Time the user has to keep changing settings before the accumulated edits
// are auto-saved to /me/settings. Any pending edits are also flushed when
// the user clicks Continue or leaves the step.
const SAVE_DEBOUNCE_MS = 800;

type EmailSettings = Pick<
	UserSettings,
	| 'subscription_delivery_email_default'
	| 'subscription_delivery_mail_option'
	| 'subscription_delivery_day'
	| 'subscription_delivery_hour'
>;

/**
 * Format the date to the user's local time, including or not the AM/PM
 * suffix depending on the user's locale.
 */
const formatDateToLocalTime = ( date: Date ) => {
	// undefined means it should use the user locale.
	const userLocale = undefined;
	return new Intl.DateTimeFormat( userLocale, {
		hour: '2-digit',
		minute: '2-digit',
	} ).format( date );
};

const padHour = ( hour: number ) => String( hour % 24 ).padStart( 2, '0' );

type SelectOption = { label: string; value: string };

// Built at render time (not module scope) so the labels pick up the user's
// locale. Explicitly typed so SelectControl treats values as plain strings
// rather than inferring a literal union that the UserSettings types don't
// satisfy.
const getFrequencyOptions = (): SelectOption[] => [
	{ label: __( 'Never send email' ), value: 'never' },
	{ label: __( 'Send email instantly' ), value: 'instantly' },
	{ label: __( 'Send email daily' ), value: 'daily' },
	{ label: __( 'Send email every week' ), value: 'weekly' },
];

const getFormatOptions = (): SelectOption[] => [
	{ label: __( 'HTML' ), value: 'html' },
	{ label: __( 'Plain text' ), value: 'text' },
];

const getDayOptions = (): SelectOption[] => [
	{ label: __( 'Sunday' ), value: '0' },
	{ label: __( 'Monday' ), value: '1' },
	{ label: __( 'Tuesday' ), value: '2' },
	{ label: __( 'Wednesday' ), value: '3' },
	{ label: __( 'Thursday' ), value: '4' },
	{ label: __( 'Friday' ), value: '5' },
	{ label: __( 'Saturday' ), value: '6' },
];

// The delivery hour buckets are stored/sent as UTC. We display them in the
// device's local time, falling back to clearly labeled UTC when the time zone
// can't be detected.
const buildDeliveryHourOptions = ( isUtcFallback: boolean, displayHour: number ) =>
	getDeliveryHourPickerHours( displayHour, isUtcFallback ).map( ( startHour ) => {
		const endHour = startHour + 2;

		if ( isUtcFallback ) {
			return {
				label: sprintf(
					// translators: %(fromHour)s and %(toHour)s are hours on a 24-hour clock, e.g. 08 and 10. UTC is the time zone.
					__( '%(fromHour)s:00 - %(toHour)s:00 UTC' ),
					{
						fromHour: padHour( startHour ),
						toHour: padHour( endHour ),
					}
				),
				value: String( startHour ),
			};
		}

		return {
			label: [
				formatDateToLocalTime( new Date( 0, 0, 0, startHour, 0 ) ),
				formatDateToLocalTime( new Date( 0, 0, 0, endHour, 0 ) ),
			].join( ' - ' ),
			value: String( startHour ),
		};
	} );

interface EmailSettingsModalProps {
	onContinue: () => void;
}

// Renders the body of the "email settings" step. The shared <Modal> wrapper
// is provided by the parent (`ReaderOnboardingRsm`); this component is only
// mounted while the step is active. X-out / escape are handled by the
// wrapper's `onRequestClose`.
export const EmailSettingsModal = ( { onContinue }: EmailSettingsModalProps ) => {
	const queryClient = useQueryClient();
	const { data: userSettings } = useQuery( userSettingsQuery() );
	const { offsetHours, isUtcFallback, timezone } = useDeliveryWindowTimezone();

	// Local working copy of the subscription settings. Seeded once from the
	// settings query; window values (hour/day) are kept in UTC just like the
	// backend stores them, and converted to local time for display only.
	const [ settings, setSettings ] = useState< EmailSettings | null >( null );
	const [ showSaveError, setShowSaveError ] = useState( false );
	const pendingChangesRef = useRef< Partial< EmailSettings > >( {} );
	const saveTimerRef = useRef< ReturnType< typeof setTimeout > | null >( null );

	useEffect( () => {
		if ( settings !== null || ! userSettings ) {
			return;
		}
		setSettings( {
			subscription_delivery_email_default: userSettings.subscription_delivery_email_default,
			subscription_delivery_mail_option: userSettings.subscription_delivery_mail_option,
			subscription_delivery_day: Number( userSettings.subscription_delivery_day ?? 0 ),
			subscription_delivery_hour: Number( userSettings.subscription_delivery_hour ?? 0 ),
		} );
	}, [ settings, userSettings ] );

	// `userSettingsMutation()` from api-queries writes to that package's
	// singleton query client, which is not the client Calypso classic boots
	// with — define the mutation locally against the contextual client so the
	// cache the rest of the app reads actually gets the merged response.
	const { mutate: saveSettings } = useMutation( {
		mutationFn: updateUserSettings,
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				userSettingsQuery().queryKey,
				( oldData ) =>
					oldData && {
						...oldData,
						...newData,
					}
			);
		},
		onError: () => setShowSaveError( true ),
	} );

	const flushPendingSave = () => {
		if ( saveTimerRef.current !== null ) {
			clearTimeout( saveTimerRef.current );
			saveTimerRef.current = null;
		}
		const changes = pendingChangesRef.current;
		if ( Object.keys( changes ).length === 0 ) {
			return;
		}
		pendingChangesRef.current = {};
		saveSettings( changes );
		Object.entries( changes ).forEach( ( [ key, value ] ) => {
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }email_settings_updated`, {
				setting_name: key,
				setting_value: String( value ),
			} );
		} );
	};

	// Keep a ref to the latest flush so the unmount cleanup (and the debounce
	// timer) always run the current closure rather than a stale one.
	const flushPendingSaveRef = useRef( flushPendingSave );
	flushPendingSaveRef.current = flushPendingSave;

	// Flush any pending (debounced) edits when the step unmounts — e.g. the
	// user dismisses the modal or navigates Back before the debounce fires.
	useEffect( () => () => flushPendingSaveRef.current(), [] );

	const handleChange = ( edit: Partial< EmailSettings > ) => {
		setShowSaveError( false );
		setSettings( ( current ) => current && { ...current, ...edit } );
		pendingChangesRef.current = { ...pendingChangesRef.current, ...edit };
		if ( saveTimerRef.current !== null ) {
			clearTimeout( saveTimerRef.current );
		}
		saveTimerRef.current = setTimeout( () => {
			saveTimerRef.current = null;
			flushPendingSaveRef.current();
		}, SAVE_DEBOUNCE_MS );
	};

	const handleContinue = () => {
		flushPendingSave();
		onContinue();
	};

	const storedUtc = settings && {
		hour: Number( settings.subscription_delivery_hour ),
		day: Number( settings.subscription_delivery_day ),
	};
	const displayWindow = storedUtc && getDisplayDeliveryWindow( storedUtc, offsetHours );

	const handleWindowChange = ( edit: Partial< { hour: number; day: number } > ) => {
		if ( ! storedUtc ) {
			return;
		}
		const utc = applyDeliveryWindowEdit( storedUtc, edit, offsetHours );
		handleChange( {
			subscription_delivery_hour: utc.hour,
			subscription_delivery_day: utc.day,
		} );
	};

	const deliveryFrequency = settings?.subscription_delivery_email_default;
	const showFormat = !! deliveryFrequency && deliveryFrequency !== 'never';
	const showHour = deliveryFrequency === 'daily' || deliveryFrequency === 'weekly';
	const showDay = deliveryFrequency === 'weekly';

	return (
		<>
			<VStack spacing={ 6 } className="email-settings-modal__content">
				<VStack spacing={ 0 }>
					<h2 className="email-settings-modal__title">{ __( 'Choose your delivery settings' ) }</h2>
					<p className="email-settings-modal__subtitle">
						{ __(
							'Please choose the default email settings for new posts from sites you subscribe to. Default settings are applied when subscribing to a site. These preferences can also be adjusted on a per-site basis in the subscriptions management page.'
						) }
					</p>
				</VStack>

				{ showSaveError && (
					<Notice
						className="email-settings-modal__error-notice"
						status="error"
						isDismissible
						onRemove={ () => setShowSaveError( false ) }
					>
						{ __( 'Failed to save your email settings. Please try again.' ) }
					</Notice>
				) }

				{ ! settings && (
					<HStack justify="center" className="email-settings-modal__loading">
						<Spinner />
					</HStack>
				) }

				{ settings && displayWindow && (
					<VStack spacing={ 4 } className="email-settings-modal__form">
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Default email delivery' ) }
							value={ settings.subscription_delivery_email_default }
							options={ getFrequencyOptions() }
							onChange={ ( value ) =>
								handleChange( { subscription_delivery_email_default: value } )
							}
						/>

						{ showFormat && (
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Email delivery format' ) }
								value={ settings.subscription_delivery_mail_option }
								options={ getFormatOptions() }
								onChange={ ( value ) =>
									handleChange( { subscription_delivery_mail_option: value } )
								}
							/>
						) }

						{ showHour && (
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Email delivery time' ) }
								value={ String( displayWindow.hour ) }
								options={ buildDeliveryHourOptions( isUtcFallback, displayWindow.hour ) }
								help={ sprintf(
									// translators: %(timezone)s is the timezone E.g. America/New_York, or UTC when the device time zone is unknown.
									__( 'Timezone: %(timezone)s' ),
									{ timezone: isUtcFallback || ! timezone ? 'UTC' : timezone }
								) }
								onChange={ ( value ) => handleWindowChange( { hour: Number( value ) } ) }
							/>
						) }

						{ showDay && (
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Email delivery day' ) }
								value={ String( displayWindow.day ) }
								options={ getDayOptions() }
								onChange={ ( value ) => handleWindowChange( { day: Number( value ) } ) }
							/>
						) }
					</VStack>
				) }
			</VStack>

			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<StepIndicator totalSteps={ 4 } currentStep={ 2 } />
					<HStack spacing={ 2 } justify="right" className="reader-onboarding-modal__footer-buttons">
						<Button __next40pxDefaultSize variant="primary" onClick={ handleContinue }>
							{ __( 'Continue' ) }
						</Button>
					</HStack>
				</HStack>
			</div>
		</>
	);
};
