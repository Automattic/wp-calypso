import {
	queryClient,
	rawUserPreferencesQuery,
	userPreferenceMutation,
} from '@automattic/api-queries';
import { QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	Button,
	CheckboxControl,
	Card,
	CardBody,
	CardDivider,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { Fragment, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Text } from '../../components/text';
import type { UserPreferences } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';
import './preferences.scss';

type InputType = 'string' | 'number' | 'checkbox';

const formattedValue = ( inputType: InputType, value?: unknown ) => {
	if ( inputType === 'number' ) {
		return Number( value );
	}

	if ( inputType === 'checkbox' ) {
		return Boolean( value );
	}

	return value;
};

const renderPreference = ( name: string, value: unknown ) => {
	if ( typeof value === 'string' ) {
		return <EditablePreference inputType="string" name={ name } value={ value } />;
	}

	if ( typeof value === 'boolean' ) {
		return <EditablePreference inputType="checkbox" name={ name } value={ value } />;
	}

	if ( typeof value === 'number' ) {
		return <EditablePreference inputType="number" name={ name } value={ value } />;
	}

	if ( Array.isArray( value ) ) {
		return <ArrayPreference value={ value } />;
	}

	return null;
};

function ArrayPreference( { value }: { value: unknown[] } ) {
	return (
		<ul>
			{ value.map( ( preference, index ) => (
				<li key={ index }>{ JSON.stringify( preference ) }</li>
			) ) }
		</ul>
	);
}

function EditablePreference( {
	inputType,
	name,
	value,
}: {
	inputType: InputType;
	name: string;
	value: unknown;
} ) {
	const { mutate: savePreference } = useMutation(
		userPreferenceMutation( name as keyof UserPreferences )
	);
	const [ formData, setFormData ] = useState( { [ name ]: value } );

	const handleSave = () => {
		// @ts-expect-error - formData[ name ] is unknown
		savePreference( formData[ name ] );
	};

	const handleReset = () => {
		setFormData( { [ name ]: value } );
	};

	const fields: Field< { [ name ]: unknown } >[] = useMemo(
		() => [
			{
				id: name,
				Edit: ( { field, onChange, data } ) => {
					const { id } = field;
					if ( inputType === 'checkbox' ) {
						return (
							<CheckboxControl
								__nextHasNoMarginBottom
								checked={ data[ id ] as unknown as boolean }
								onChange={ ( newValue ) =>
									onChange( { [ id ]: formattedValue( inputType, newValue ) } )
								}
							/>
						);
					}

					return (
						<InputControl
							type={ inputType }
							value={ data[ id ] as unknown as string }
							size="small"
							onChange={ ( newValue ) =>
								onChange( { [ id ]: formattedValue( inputType, newValue ) } )
							}
							hideLabelFromVision
						/>
					);
				},
			},
		],
		[ name, inputType ]
	);

	const isDirty = formData[ name ] !== value;

	return (
		<VStack>
			<DataForm< { [ name ]: unknown } >
				data={ formData }
				fields={ fields }
				form={ {
					layout: { type: 'regular' as const },
					fields: [ name ],
				} }
				onChange={ ( edits ) => {
					setFormData( ( current ) => ( { ...current, ...edits } ) );
				} }
			/>
			<HStack justify="flex-start" spacing={ 1 }>
				<Button variant="primary" size="small" disabled={ ! isDirty } onClick={ handleSave }>
					{ __( 'Save' ) }
				</Button>
				<Button variant="secondary" size="small" disabled={ ! isDirty } onClick={ handleReset }>
					{ __( 'Reset' ) }
				</Button>
			</HStack>
		</VStack>
	);
}

function Preference( { name, value }: { name: string; value: unknown } ) {
	const { mutate: unsetPreference } = useMutation(
		userPreferenceMutation( name as keyof UserPreferences )
	);

	return (
		<div className="preferences-helper__preference">
			<HStack justify="flex-start" spacing={ 1 }>
				<Button
					icon={ closeSmall }
					size="compact"
					title={ __( 'Unset preference' ) }
					onClick={ () =>
						unsetPreference( null as unknown as UserPreferences[ keyof UserPreferences ] )
					}
				/>
				<Text>{ name }</Text>
			</HStack>
			<div className="preferences-helper__preference-content">
				{ renderPreference( name, value ) }
			</div>
		</div>
	);
}

function PreferenceList() {
	const { data: preferences } = useQuery( rawUserPreferencesQuery() );
	const entries = useMemo(
		() => Object.entries( preferences ?? {} ).sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) ),
		[ preferences ]
	);

	return (
		<div>
			<div>{ __( 'Preferences' ) }</div>
			<Card size="xSmall" className="preferences-helper__preferences">
				{ entries.length > 0 ? (
					entries.map( ( [ name, value ], index ) => (
						<Fragment key={ name }>
							<CardBody>
								<Preference name={ name } value={ value } />
							</CardBody>
							{ index < entries.length - 1 && <CardDivider /> }
						</Fragment>
					) )
				) : (
					<CardBody>
						<Text>{ __( 'No preferences' ) }</Text>
					</CardBody>
				) }
			</Card>
		</div>
	);
}

export function loadPreferencesHelper() {
	const element = document.querySelector( '.environment.is-prefs' );
	if ( element ) {
		createRoot( element ).render(
			<QueryClientProvider client={ queryClient }>
				<PreferenceList />
			</QueryClientProvider>
		);
	}
}
