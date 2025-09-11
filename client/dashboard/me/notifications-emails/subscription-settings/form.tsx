import { UserSettings } from '@automattic/api-core';
import { CheckboxControl } from '@wordpress/components';
import { DataForm, Field, type Form } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from 'react';
import InlineSupportLink from '../../../components/inline-support-link';

export type SettingsData = Pick<
	UserSettings,
	| 'p2_disable_autofollow_on_comment'
	| 'subscription_delivery_day'
	| 'subscription_delivery_email_default'
	| 'subscription_delivery_hour'
	| 'subscription_delivery_jabber_default'
	| 'subscription_delivery_mail_option'
>;

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
	},
	{
		id: 'subscription_delivery_mail_option',
		label: __( 'Email delivery format' ),
		type: 'text' as const,
		elements: [
			{ label: __( 'HTML' ), value: 'html' },
			{ label: __( 'Plain text' ), value: 'text' },
		],
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
	},
	{
		id: 'subscription_delivery_hour',
		label: __( 'Hour' ),
		type: 'integer' as const,
		elements: [
			{
				label: __( '12:00 AM - 2:00 AM' ),
				value: 0,
			},
			{
				label: __( '2:00 AM - 4:00 AM' ),
				value: 2,
			},
			{
				label: __( '4:00 AM - 6:00 AM' ),
				value: 4,
			},
			{
				label: __( '6:00 AM - 8:00 AM' ),
				value: 6,
			},
			{
				label: __( '8:00 AM - 10:00 AM' ),
				value: 8,
			},
			{
				label: __( '10:00 AM - 12:00 PM' ),
				value: 10,
			},
			{
				label: __( '12:00 PM - 2:00 PM' ),
				value: 12,
			},
			{
				label: __( '2:00 PM - 4:00 PM' ),
				value: 14,
			},
			{
				label: __( '4:00 PM - 6:00 PM' ),
				value: 16,
			},
			{
				label: __( '6:00 PM - 8:00 PM' ),
				value: 18,
			},
			{
				label: __( '8:00 PM - 10:00 PM' ),
				value: 20,
			},
			{
				label: __( '10:00 PM - 12:00 AM' ),
				value: 22,
			},
		],
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
		label: __( 'Automatically subscribe to P2 post notifications when you leave a comment.' ),
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

export const getFields = ( includeAutomatticianFields: boolean ): Field< SettingsData >[] => {
	if ( includeAutomatticianFields ) {
		return baseFields;
	}

	return baseFields.filter( ( field ) => {
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
	const result: Partial< SettingsData > = {};
	for ( const key of getSettingsKeys() ) {
		if ( key && key in data ) {
			// @ts-expect-error data[ key ] is of type string | number | boolean
			result[ key ] = data[ key ] as SettingsData[ keyof SettingsData ];
		}
	}
	return result as SettingsData;
};

/**
 * Workaround for a known issue https://github.com/WordPress/gutenberg/issues/71616 where integer fields
 * are returned as strings in the onChange callback, regardless of their defined Field type.
 * This function ensures that integer fields are properly converted to numbers.
 */
const normalizeDataState = ( dataState: Partial< SettingsData > ) => {
	if ( typeof dataState.subscription_delivery_hour === 'string' ) {
		dataState.subscription_delivery_hour = parseInt( dataState.subscription_delivery_hour );
	}

	if ( typeof dataState.subscription_delivery_day === 'string' ) {
		dataState.subscription_delivery_day = parseInt( dataState.subscription_delivery_day );
	}

	return dataState;
};

interface FormProps {
	data: SettingsData;
	isAutomattician: boolean;
	onChange: ( data: SettingsData ) => void;
}

export const SubscriptionSettingsForm = ( { data, isAutomattician, onChange }: FormProps ) => {
	const handleChange = useCallback(
		( edit: Partial< SettingsData > ) => {
			onChange( Object.assign( {}, data, normalizeDataState( edit ) ) as SettingsData );
		},
		[ onChange, data ]
	);

	const fields = useMemo( () => getFields( isAutomattician ), [ isAutomattician ] );
	const form: Form = {
		layout: { type: 'regular' as const },
		fields: [
			'subscription_delivery_email_default',
			'subscription_delivery_mail_option',
			{
				children: [ 'subscription_delivery_day', 'subscription_delivery_hour' ],
				id: 'subscription_delivery_window',
				label: 'Email delivery window',
				layout: {
					type: 'regular' as const,
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
			data={ data }
			onChange={ handleChange }
		/>
	);
};
