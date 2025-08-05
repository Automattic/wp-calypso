import {
	Button,
	CheckboxControl,
	__experimentalView as View,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { NameServerInput, validateField } from './form-input';
import { NameServerField, MIN_NAMESERVER_LENGTH, MAX_NAMESERVER_LENGTH } from './types';

interface Props {
	nameservers?: string[];
	onSubmit: ( nameServers: string[] ) => void;
}

export default function NameServersForm( { nameservers = [], onSubmit }: Props ) {
	const [ useCustomNameServers, setUseCustomNameServers ] = useState( nameservers.length > 0 );
	const [ nameServerFields, setNameServerFields ] = useState< NameServerField[] >(
		Array( MAX_NAMESERVER_LENGTH )
			.fill( null )
			.map( ( _, index ) => ( {
				value: nameservers[ index ] || '',
				error: '',
				touched: false,
			} ) )
	);

	const isFormValid = useMemo( () => {
		// If custom nameservers are disabled, form is valid
		if ( ! useCustomNameServers ) {
			return true;
		}

		// Check if there are any errors
		if ( nameServerFields.some( ( ns ) => ns.error !== '' ) ) {
			return false;
		}

		// Check if minimum required nameservers are provided
		const filledNameServers = nameServerFields.filter( ( ns ) => ns.value !== '' ).length;
		return filledNameServers >= MIN_NAMESERVER_LENGTH;
	}, [ useCustomNameServers, nameServerFields ] );

	const handleNameServerChange = useCallback( ( index: number, value: string ) => {
		setNameServerFields( ( current ) => {
			const updated = [ ...current ];
			updated[ index ] = {
				...updated[ index ],
				value,
				error: updated[ index ].touched ? validateField( value, index ) : '',
			};
			return updated;
		} );
	}, [] );

	const handleNameServerBlur = useCallback( ( index: number ) => {
		setNameServerFields( ( current ) => {
			if ( current[ index ].touched ) {
				return current;
			}
			const updated = [ ...current ];
			updated[ index ] = {
				...updated[ index ],
				touched: true,
				error: validateField( updated[ index ].value, index ),
			};
			return updated;
		} );
	}, [] );

	const shouldShowNextInput = useCallback(
		( index: number ) => {
			if ( index >= MAX_NAMESERVER_LENGTH ) {
				return false;
			} else if ( index < MIN_NAMESERVER_LENGTH ) {
				return true;
			}

			// Show next if previous has value
			return nameServerFields[ index - 1 ].value !== '';
		},
		[ nameServerFields ]
	);

	return (
		<VStack spacing={ 4 }>
			<Text>
				<CheckboxControl
					label={ __( 'Use custom name servers' ) }
					checked={ useCustomNameServers }
					onChange={ () => {
						setUseCustomNameServers( ( current ) => ! current );
						setNameServerFields(
							Array( MAX_NAMESERVER_LENGTH )
								.fill( null )
								.map( () => ( { value: '', error: '', touched: false } ) )
						);
					} }
				/>
			</Text>
			{ useCustomNameServers &&
				Array.from( { length: Math.ceil( MAX_NAMESERVER_LENGTH / 2 ) }, ( _, i ) => i * 2 ).map(
					( rowIndex ) => {
						// Check if either input in this row would be shown
						const shouldShowRow =
							shouldShowNextInput( rowIndex ) || shouldShowNextInput( rowIndex + 1 );

						return (
							shouldShowRow && (
								<HStack key={ rowIndex } spacing={ 4 } justify="space-between" alignment="top">
									{ [ 0, 1 ].map( ( colIndex ) => {
										const index = rowIndex + colIndex;
										return (
											shouldShowNextInput( index ) && (
												<NameServerInput
													key={ index }
													index={ index }
													field={ nameServerFields[ index ] }
													disabled={ ! useCustomNameServers }
													onChange={ handleNameServerChange }
													onBlur={ handleNameServerBlur }
												/>
											)
										);
									} ) }
								</HStack>
							)
						);
					}
				) }
			<View>
				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ ! isFormValid }
					onClick={ () =>
						onSubmit(
							nameServerFields.filter( ( ns ) => ns.value !== '' ).map( ( ns ) => ns.value )
						)
					}
				>
					{ __( 'Save' ) }
				</Button>
			</View>
		</VStack>
	);
}
