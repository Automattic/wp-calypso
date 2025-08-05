import {
	Button,
	__experimentalView as View,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
	CheckboxControl,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { validateHostname } from './utils';

const MIN_NAMESERVER_LENGTH = 2;
const MAX_NAMESERVER_LENGTH = 4;

export default function NameServersForm() {
	const [ useCustomNameServers, setUseCustomNameServers ] = useState( true );
	const [ nameServers, setNameServers ] = useState< string[] >(
		new Array( MAX_NAMESERVER_LENGTH ).fill( '' )
	);
	const [ errors, setErrors ] = useState< string[] >(
		new Array( MAX_NAMESERVER_LENGTH ).fill( '' )
	);
	const [ touchedFields, setTouchedFields ] = useState< boolean[] >(
		new Array( MAX_NAMESERVER_LENGTH ).fill( false )
	);

	const isFormValid = () => {
		// If custom nameservers are disabled, form is valid
		if ( ! useCustomNameServers ) {
			return true;
		}

		// Check if there are any errors
		if ( errors.some( ( error ) => error !== '' ) ) {
			return false;
		}

		// Check if minimum required nameservers are provided
		const filledNameServers = nameServers.filter( ( ns ) => ns !== '' ).length;
		return filledNameServers >= MIN_NAMESERVER_LENGTH;
	};

	const validateField = ( value: string, index: number ) => {
		if ( value === '' ) {
			if ( index < MIN_NAMESERVER_LENGTH ) {
				return __( 'This field is required' );
			}
			return '';
		}
		if ( ! validateHostname( value ) ) {
			return __( 'Please enter a valid hostname' );
		}
		return '';
	};

	const handleNameServerChange = ( index: number, value: string ) => {
		const newNameServers = [ ...nameServers ];
		const newErrors = [ ...errors ];

		newNameServers[ index ] = value;

		// Only validate if the field has been touched before
		if ( touchedFields[ index ] ) {
			newErrors[ index ] = validateField( value, index );
		}

		setNameServers( newNameServers );
		setErrors( newErrors );
	};

	const handleNameServerBlur = ( index: number ) => {
		if ( ! touchedFields[ index ] ) {
			const newTouchedFields = [ ...touchedFields ];
			newTouchedFields[ index ] = true;
			setTouchedFields( newTouchedFields );

			// Validate on first blur
			const newErrors = [ ...errors ];
			newErrors[ index ] = validateField( nameServers[ index ], index );
			setErrors( newErrors );
		}
	};

	const shouldShowNextInput = ( index: number ) => {
		if ( index >= MAX_NAMESERVER_LENGTH ) {
			return false;
		} else if ( index < MIN_NAMESERVER_LENGTH ) {
			return true;
		}

		// Show next if previous has value
		return nameServers[ index - 1 ] !== '';
	};

	return (
		<VStack spacing={ 4 }>
			<Text>
				<CheckboxControl
					label={ __( 'Use custom name servers' ) }
					checked={ useCustomNameServers }
					onChange={ () => setUseCustomNameServers( ! useCustomNameServers ) }
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
												<div
													className={ `nameserver-input-container ${
														errors[ index ] ? 'is-error' : ''
													}` }
												>
													<InputControl
														key={ index }
														__next40pxDefaultSize
														disabled={ ! useCustomNameServers }
														// translators: sd is the name server number
														label={ sprintf( __( 'Custom name server %s' ), index + 1 ) }
														placeholder={
															index < MIN_NAMESERVER_LENGTH
																? // translators: s% is the name server number
																  sprintf( __( 'ns%s.domain.com' ), index + 1 )
																: // translators: s% is the name server number
																  sprintf( __( 'ns%s.domain.com (optional)' ), index + 1 )
														}
														value={ nameServers[ index ] }
														onChange={ ( value ) =>
															handleNameServerChange( index, value as string )
														}
														onBlur={ () => handleNameServerBlur( index ) }
													/>
													{ errors[ index ] && (
														<Text className="validation-msg">{ errors[ index ] }</Text>
													) }
												</div>
											)
										);
									} ) }
								</HStack>
							)
						);
					}
				) }
			<View>
				<Button __next40pxDefaultSize variant="primary" disabled={ ! isFormValid() }>
					{ __( 'Save' ) }
				</Button>
			</View>
		</VStack>
	);
}
