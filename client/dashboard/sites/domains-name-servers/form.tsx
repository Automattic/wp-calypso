import {
	Button,
	ToggleControl,
	__experimentalText as Text,
	__experimentalView as View,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { NameServerInput, validateField } from './form-input';
import {
	NameServerField,
	MIN_NAMESERVER_LENGTH,
	MAX_NAMESERVER_LENGTH,
	WPCOM_DEFAULT_NAMESERVERS,
} from './types';
import { areAllWpcomNameServers } from './utils';

interface Props {
	nameservers?: string[];
	onSubmit: ( nameServers: string[] ) => void;
}

export default function NameServersForm( { nameservers = [], onSubmit }: Props ) {
	const [ nameServerFields, setNameServerFields ] = useState< NameServerField[] >(
		Array.from( { length: MAX_NAMESERVER_LENGTH }, ( _, index ) => ( {
			value: nameservers[ index ] || '',
			error: '',
			touched: false,
		} ) )
	);
	const [ useWpcomNameservers, setUseWpcomNameservers ] = useState(
		areAllWpcomNameServers( nameservers )
	);

	const hasFieldsChanged = useMemo( () => {
		// Get current non-empty values
		const currentValues = nameServerFields
			.filter( ( ns ) => ns.value !== '' )
			.map( ( ns ) => ns.value )
			.sort();

		// Get initial values
		const initialValues = [ ...nameservers ].sort();

		// Compare arrays
		if ( currentValues.length !== initialValues.length ) {
			return true;
		}

		return currentValues.some( ( value, index ) => value !== initialValues[ index ] );
	}, [ nameServerFields, nameservers ] );

	const isFormValid = useMemo( () => {
		// Check if there are any errors
		if ( nameServerFields.some( ( ns ) => ns.error !== '' ) ) {
			return false;
		}

		// Check if minimum required nameservers are provided
		const filledNameServers = nameServerFields.filter( ( ns ) => ns.value !== '' ).length;
		return filledNameServers >= MIN_NAMESERVER_LENGTH;
	}, [ nameServerFields ] );

	const canSubmit = useMemo( () => {
		return isFormValid && hasFieldsChanged;
	}, [ isFormValid, hasFieldsChanged ] );

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
			// When using WP.com nameservers, only show fields that have values
			if ( useWpcomNameservers ) {
				return nameServerFields[ index ]?.value !== '';
			}

			// For custom nameservers
			if ( index >= MAX_NAMESERVER_LENGTH ) {
				return false;
			} else if ( index < MIN_NAMESERVER_LENGTH ) {
				return true;
			}

			// Show next if previous has value
			return nameServerFields[ index - 1 ]?.value !== '';
		},
		[ nameServerFields, useWpcomNameservers ]
	);

	return (
		<VStack spacing={ 4 }>
			<ToggleControl
				label={ __( 'Use WordPress.com name servers' ) }
				checked={ useWpcomNameservers }
				onChange={ () => {
					const willUseWpcom = ! useWpcomNameservers;
					const newFields = willUseWpcom
						? WPCOM_DEFAULT_NAMESERVERS.map( ( ns ) => ( {
								value: ns.toUpperCase(),
								error: '',
								touched: false,
						  } ) )
						: Array.from( { length: MAX_NAMESERVER_LENGTH }, () => ( {
								value: '',
								error: '',
								touched: false,
						  } ) );

					setUseWpcomNameservers( willUseWpcom );
					setNameServerFields( newFields );
				} }
			/>
			<Text>Look up the name servers for popular hosts.</Text>
			{ Array.from(
				{ length: MAX_NAMESERVER_LENGTH },
				( _, index ) =>
					nameServerFields[ index ] &&
					shouldShowNextInput( index ) && (
						<NameServerInput
							key={ index }
							index={ index }
							field={ nameServerFields[ index ] }
							disabled={ useWpcomNameservers }
							onChange={ handleNameServerChange }
							onBlur={ handleNameServerBlur }
						/>
					)
			) }
			<View>
				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ ! canSubmit }
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
