import { UserSettings } from '@automattic/api-core';
import {
	applyDeliveryWindowEdit,
	getDeliveryHourPickerHours,
	getDisplayDeliveryWindow,
	useDeliveryWindowTimezone,
} from '@automattic/i18n-utils';
import { CheckboxControl, SelectControl } from '@wordpress/components';
import { DataForm, DataFormControlProps, Field, type Form } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import InlineSupportLink from '../../../components/inline-support-link';

/**
 * Format the date to the user's local time
 * Including or not the AM/PM suffix depending on the user's locale
 * It will also include the time zone if the user has it set
 * @param date - The date to format
 * @returns The formatted date
 */
const formatDateToLocalTime = ( date: Date ) => {
	//undefined means it should use the user locale
	const userLocale = undefined;
	return new Intl.DateTimeFormat( userLocale, {
		hour: '2-digit',
		minute: '2-digit',
	} ).format( date );
};

const padHour = ( hour: number ) => String( hour % 24 ).padStart( 2, '0' );

// The delivery hour buckets are stored/sent as UTC. We display them in the
// device's local time, falling back to clearly labeled UTC when the time zone
// can't be detected.
const buildDeliveryHourElements = ( isUtcFallback: boolean, displayHour: number ) =>
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
				value: startHour,
			};
		}

		return {
			label: [
				formatDateToLocalTime( new Date( 0, 0, 0, startHour, 0 ) ),
				formatDateToLocalTime( new Date( 0, 0, 0, endHour, 0 ) ),
			].join( ' - ' ),
			value: startHour,
		};
	} );

const buildDeliveryHourDescription = ( isUtcFallback: boolean, timezone?: string ) => {
	return sprintf(
		// translators: %(timezone)s is the timezone E.g. America/New_York, or UTC when the device time zone is unknown.
		__( 'Timezone: %(timezone)s' ),
		{
			timezone: isUtcFallback || ! timezone ? 'UTC' : timezone,
		}
	);
};

function applyDeliveryWindowToHourField(
	fields: Field< SettingsData >[],
	delivery: DeliveryWindowDisplay,
	displayHour: number
): Field< SettingsData >[] {
	return fields.map( ( field ) => {
		if ( field.id !== 'subscription_delivery_hour' ) {
			return field;
		}

		return {
			...field,
			description: buildDeliveryHourDescription( delivery.isUtcFallback, delivery.timezone ),
			elements: buildDeliveryHourElements( delivery.isUtcFallback, displayHour ),
		};
	} );
}

export type SettingsData = Pick<
	UserSettings,
	| 'p2_disable_autofollow_on_comment'
	| 'subscription_delivery_day'
	| 'subscription_delivery_email_default'
	| 'subscription_delivery_hour'
	| 'subscription_delivery_jabber_default'
	| 'subscription_delivery_mail_option'
>;

const CustomSelectControl = ( { field, data, onChange }: DataFormControlProps< SettingsData > ) => {
	const { id, getValue } = field;
	return (
		<SelectControl
			label={ field.label }
			value={ getValue( { item: data } ) }
			options={ field.elements ?? [] }
			help={ field.description }
			onChange={ ( value ) => {
				onChange( { [ id ]: value } );
			} }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		>
			{ field.elements?.map( ( element: { label: string; value: string } ) => (
				<option key={ element.value } value={ element.value }>
					{ element.label }
				</option>
			) ) }
		</SelectControl>
	);
};

const baseFields: Field< SettingsData >[] = [
	{
		id: 'subscription_delivery_email_default',
		label: __( 'Default email delivery' ),
		type: 'text' as const,
		elements: [
			{ label: __( 'Never send email' ), value: 'never' },
			{ label: __( 'Send email instantly' ), value: 'instantly' },
			{ label: __( 'Send email daily' ), value: 'daily' },
			{ label: __( 'Send email every week' ), value: 'weekly' },
		],
		Edit: CustomSelectControl,
	},
	{
		id: 'subscription_delivery_mail_option',
		label: __( 'Email delivery format' ),
		type: 'text' as const,
		elements: [
			{ label: __( 'HTML' ), value: 'html' },
			{ label: __( 'Plain text' ), value: 'text' },
		],
		Edit: CustomSelectControl,
	},
	{
		id: 'subscription_delivery_day',
		label: __( 'Day' ),
		type: 'integer' as const,
		elements: [
			{ label: __( 'Sunday' ), value: 0 },
			{ label: __( 'Monday' ), value: 1 },
			{ label: __( 'Tuesday' ), value: 2 },
			{ label: __( 'Wednesday' ), value: 3 },
			{ label: __( 'Thursday' ), value: 4 },
			{ label: __( 'Friday' ), value: 5 },
			{ label: __( 'Saturday' ), value: 6 },
		],
		Edit: CustomSelectControl,
	},
	{
		id: 'subscription_delivery_hour',
		label: __( 'Hour' ),
		type: 'integer' as const,
		Edit: CustomSelectControl,
	},
	{
		id: 'subscription_delivery_jabber_default',
		label: __( 'Jabber subscription delivery' ),
		type: 'boolean' as const,
		Edit: ( { field, data, onChange } ) => {
			const { id, getValue } = field;

			return (
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ field.label }
					help={
						<span>
							{ __( 'Receive subscription updates via instant message.' ) }{ ' ' }
							<InlineSupportLink supportContext="jabber-subscription-updates" />
						</span>
					}
					checked={ getValue( { item: data } ) }
					onChange={ () => {
						onChange( { [ id ]: ! getValue( { item: data } ) } );
					} }
				/>
			);
		},
	},
	{
		id: 'p2_disable_autofollow_on_comment',
		label: __( 'Automatically subscribe to P2 post notifications when you leave a comment' ),
		description: __( 'Auto-follow P2 posts (Automatticians only)' ),
		type: 'boolean' as const,
		Edit: ( { field, data, hideLabelFromVision, onChange } ) => {
			const { id, getValue, description } = field;
			return (
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : field.label }
					help={ description }
					checked={ getValue( { item: data } ) }
					onChange={ () => {
						onChange( { [ id ]: ! getValue( { item: data } ) } );
					} }
				/>
			);
		},
	},
];

const automatticianFields = [ 'p2_disable_autofollow_on_comment' ];

export interface DeliveryWindowDisplay {
	isUtcFallback: boolean;
	timezone?: string;
}

export const getFields = (
	includeAutomatticianFields: boolean,
	deliveryWindow: DeliveryWindowDisplay,
	displayHour: number
): Field< SettingsData >[] => {
	const fields = applyDeliveryWindowToHourField( baseFields, deliveryWindow, displayHour );

	if ( includeAutomatticianFields ) {
		return fields;
	}

	return fields.filter( ( field ) => {
		return ! automatticianFields.includes( field.id );
	} );
};

export const getSettingsKeys = (): ( keyof SettingsData )[] => {
	return [
		'subscription_delivery_email_default',
		'subscription_delivery_mail_option',
		'subscription_delivery_day',
		'subscription_delivery_hour',
		'subscription_delivery_jabber_default',
		'p2_disable_autofollow_on_comment',
	];
};

export const getSettings = ( data: UserSettings ): SettingsData => {
	return getSettingsKeys().reduce( ( acc, key ) => {
		// @ts-expect-error data[ key ] is of type string | number | boolean
		acc[ key ] = data[ key ] as SettingsData[ keyof SettingsData ];

		return acc;
	}, {} as SettingsData );
};

interface FormProps {
	data: SettingsData;
	isAutomattician: boolean;
	onChange: ( data: SettingsData ) => void;
}

export const SubscriptionSettingsForm = ( { data, isAutomattician, onChange }: FormProps ) => {
	const { offsetHours, isUtcFallback, timezone } = useDeliveryWindowTimezone();

	// The backend stores/sends the delivery window as UTC. Present it to the
	// DataForm in local time, and convert edits back to UTC before bubbling up.
	const storedUtc = useMemo(
		() => ( {
			hour: Number( data.subscription_delivery_hour ?? 0 ),
			day: Number( data.subscription_delivery_day ?? 0 ),
		} ),
		[ data.subscription_delivery_hour, data.subscription_delivery_day ]
	);

	const localData = useMemo( () => {
		const display = getDisplayDeliveryWindow( storedUtc, offsetHours );
		return {
			...data,
			subscription_delivery_hour: display.hour,
			subscription_delivery_day: display.day,
		};
	}, [ data, offsetHours, storedUtc ] );

	const handleChange = useCallback(
		( edit: Partial< SettingsData > ) => {
			const touchesWindow =
				'subscription_delivery_hour' in edit || 'subscription_delivery_day' in edit;

			if ( ! touchesWindow ) {
				onChange( Object.assign( {}, data, edit ) as SettingsData );
				return;
			}

			const windowEdit: Partial< { hour: number; day: number } > = {};
			if ( 'subscription_delivery_hour' in edit ) {
				windowEdit.hour = Number( edit.subscription_delivery_hour );
			}
			if ( 'subscription_delivery_day' in edit ) {
				windowEdit.day = Number( edit.subscription_delivery_day );
			}
			const utc = applyDeliveryWindowEdit( storedUtc, windowEdit, offsetHours );
			onChange(
				Object.assign( {}, data, edit, {
					subscription_delivery_hour: utc.hour,
					subscription_delivery_day: utc.day,
				} ) as SettingsData
			);
		},
		[ onChange, data, storedUtc, offsetHours ]
	);

	const fields = useMemo(
		() =>
			getFields(
				isAutomattician,
				{ isUtcFallback, timezone },
				Number( localData.subscription_delivery_hour ?? 0 )
			),
		[ isAutomattician, isUtcFallback, timezone, localData.subscription_delivery_hour ]
	);
	const form: Form = {
		layout: { type: 'regular' as const },
		fields: [
			'subscription_delivery_email_default',
			'subscription_delivery_mail_option',
			{
				children: [ 'subscription_delivery_day', 'subscription_delivery_hour' ],
				id: 'subscription_delivery_window',
				label: __( 'Email delivery window' ),
				layout: {
					type: 'row' as const,
					alignment: 'start' as const,
				},
			},
			'subscription_delivery_jabber_default',
			...( isAutomattician ? [ 'p2_disable_autofollow_on_comment' ] : [] ),
		],
	};

	return (
		<DataForm< SettingsData >
			fields={ fields }
			form={ form }
			data={ localData }
			onChange={ handleChange }
		/>
	);
};
