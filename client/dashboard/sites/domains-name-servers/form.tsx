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

const MIN_NAMESERVER_LENGTH = 2;
const MAX_NAMESERVER_LENGTH = 4;

export default function NameServersForm() {
	const [ useCustomNameServers, setUseCustomNameServers ] = useState( true );
	const [ nameServers, setNameServers ] = useState< string[] >(
		new Array( MAX_NAMESERVER_LENGTH ).fill( '' )
	);

	const handleNameServerChange = ( index: number, value: string ) => {
		const newNameServers = [ ...nameServers ];
		newNameServers[ index ] = value;
		setNameServers( newNameServers );
	};

	const shouldShowNextInput = ( index: number ) => {
		if ( index >= MAX_NAMESERVER_LENGTH ) {
			return false;
		}
		if ( index < MIN_NAMESERVER_LENGTH ) {
			return true;
		}
		return nameServers[ index - 1 ] !== ''; // Show next if previous has value
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
												<div className="nameserver-input-container is-error">
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
													/>
													<Text className="validation-msg">This is an error message example</Text>
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
				<Button __next40pxDefaultSize variant="primary">
					{ __( 'Save' ) }
				</Button>
			</View>
		</VStack>
	);
}
