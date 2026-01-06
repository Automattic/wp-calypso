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
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import deepmerge from 'deepmerge';
import { Fragment, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, CardBody, CardDivider } from '../../components/card';
import { Text } from '../../components/text';
import { buildPartialUpdate } from './helpers/deep-merge';
import type { UserPreferences } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

import './preferences.scss';

type InputType = 'text' | 'number' | 'checkbox';

function getInputType( value: unknown ): InputType {
	if ( typeof value === 'boolean' ) {
		return 'checkbox';
	}
	if ( typeof value === 'number' ) {
		return 'number';
	}
	return 'text';
}

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
		return <EditablePreference inputType="text" name={ name } value={ value } />;
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

	if ( typeof value === 'object' && value !== null ) {
		return <ObjectPreference name={ name } value={ value as Record< string, unknown > } />;
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

function ObjectPreference( { name, value }: { name: string; value: Record< string, unknown > } ) {
	return (
		<VStack spacing={ 2 } className="preferences-helper__object">
			{ Object.entries( value ).map( ( [ propertyKey, propertyValue ] ) => (
				<ObjectPropertyField
					key={ propertyKey }
					preferenceName={ name }
					propertyPath={ [ propertyKey ] }
					propertyKey={ propertyKey }
					propertyValue={ propertyValue }
				/>
			) ) }
		</VStack>
	);
}

function ObjectPropertyField( {
	preferenceName,
	propertyPath,
	propertyKey,
	propertyValue,
}: {
	preferenceName: string;
	propertyPath: string[];
	propertyKey: string;
	propertyValue: unknown;
} ) {
	const { mutate: savePreference, isPending } = useMutation(
		userPreferenceMutation( preferenceName as keyof UserPreferences )
	);
	const [ localValue, setLocalValue ] = useState( propertyValue );

	// Handle nested objects recursively
	if (
		typeof propertyValue === 'object' &&
		propertyValue !== null &&
		! Array.isArray( propertyValue )
	) {
		return (
			<VStack spacing={ 1 } alignment="flex-start">
				<Text className="preferences-helper__property-label">{ propertyKey }:</Text>
				<div className="preferences-helper__nested-object">
					{ Object.entries( propertyValue as Record< string, unknown > ).map(
						( [ nestedKey, nestedValue ] ) => (
							<ObjectPropertyField
								key={ nestedKey }
								preferenceName={ preferenceName }
								propertyPath={ [ ...propertyPath, nestedKey ] }
								propertyKey={ nestedKey }
								propertyValue={ nestedValue }
							/>
						)
					) }
				</div>
			</VStack>
		);
	}

	const handleSave = () => {
		const currentPreferences = queryClient.getQueryData< UserPreferences >(
			rawUserPreferencesQuery().queryKey
		);
		const currentPreference = currentPreferences?.[ preferenceName as keyof UserPreferences ];
		const partialUpdate = buildPartialUpdate( propertyPath, localValue );
		const mergedPreference = currentPreference
			? deepmerge( currentPreference as object, partialUpdate )
			: partialUpdate;

		// @ts-expect-error - mergedPreference type is dynamic
		savePreference( mergedPreference );
	};

	const handleReset = () => {
		setLocalValue( propertyValue );
	};

	const isDirty = localValue !== propertyValue;
	const inputType = getInputType( propertyValue );

	const handleChange = ( newValue: string | undefined ) => {
		setLocalValue( formattedValue( inputType, newValue ) );
	};

	return (
		<HStack spacing={ 2 } alignment="top" className="preferences-helper__property-row">
			<Text className="preferences-helper__property-label">{ propertyKey }:</Text>
			<VStack spacing={ 1 } expanded alignment="flex-start">
				{ inputType === 'checkbox' ? (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ localValue as boolean }
						onChange={ setLocalValue }
						disabled={ isPending }
					/>
				) : (
					<InputControl
						type={ inputType }
						value={ String( localValue ?? '' ) }
						size="small"
						onChange={ handleChange }
						disabled={ isPending }
					/>
				) }
				<HStack justify="flex-start" spacing={ 1 }>
					<Button
						variant="primary"
						size="small"
						disabled={ ! isDirty || isPending }
						onClick={ handleSave }
					>
						{ __( 'Save' ) }
					</Button>
					<Button
						variant="secondary"
						size="small"
						disabled={ ! isDirty || isPending }
						onClick={ handleReset }
					>
						{ __( 'Reset' ) }
					</Button>
				</HStack>
			</VStack>
		</HStack>
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
