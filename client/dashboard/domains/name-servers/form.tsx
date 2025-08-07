// eslint-disable-next-line no-restricted-imports
import { CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS } from '@automattic/urls';
import {
	Button,
	ToggleControl,
	__experimentalText as Text,
	__experimentalView as View,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import Notice from '../../components/notice';
import { getServiceName } from '../../utils/service-name';
import { NameServerInput, validateField } from './form-input';
import {
	NameServerField,
	MIN_NAME_SERVERS_LENGTH,
	MAX_NAME_SERVERS_LENGTH,
	WPCOM_DEFAULT_NAME_SERVERS,
} from './types';
import UpsellNudge from './upsell-nudge';
import { areAllWpcomNameServers } from './utils';
import type { InstanceType } from '../../app/context';

interface Props {
	domainName: string;
	serviceName: string;
	instanceType: InstanceType;
	showUpsellNudge?: boolean;
	nameServers?: string[];
	isBusy?: boolean;
	queryError?: string;
	onSubmit: ( nameServers: string[] ) => void;
}

export default function NameServersForm( {
	domainName,
	instanceType,
	showUpsellNudge,
	nameServers = [],
	isBusy,
	queryError,
	onSubmit,
}: Props ) {
	const [ nameServerFields, setNameServerFields ] = useState< NameServerField[] >(
		Array.from( { length: MAX_NAME_SERVERS_LENGTH }, ( _, index ) => ( {
			value: nameServers[ index ] || '',
			error: '',
			touched: false,
		} ) )
	);
	const [ useWpcomNameservers, setUseWpcomNameservers ] = useState(
		areAllWpcomNameServers( nameServers )
	);

	const hasFieldsChanged = useMemo( () => {
		// Get current non-empty values
		const currentValues = nameServerFields
			.filter( ( ns ) => ns.value !== '' )
			.map( ( ns ) => ns.value )
			.sort();

		// Get initial values
		const initialValues = [ ...nameServers ].sort();

		// Compare arrays
		if ( currentValues.length !== initialValues.length ) {
			return true;
		}

		return currentValues.some( ( value, index ) => value !== initialValues[ index ] );
	}, [ nameServerFields, nameServers ] );

	const isFormValid = useMemo( () => {
		// Check if there are any errors
		if ( nameServerFields.some( ( ns ) => ns.error !== '' ) ) {
			return false;
		}

		// Check if minimum required name servers are provided
		const filledNameServers = nameServerFields.filter( ( ns ) => ns.value !== '' ).length;
		return filledNameServers >= MIN_NAME_SERVERS_LENGTH;
	}, [ nameServerFields ] );

	const canSubmit = useMemo( () => {
		return isFormValid && hasFieldsChanged && ! isBusy;
	}, [ isFormValid, hasFieldsChanged, isBusy ] );

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
			// When using WP.com name servers, only show fields that have values
			if ( useWpcomNameservers ) {
				return nameServerFields[ index ]?.value !== '';
			}

			// For custom name servers
			if ( index >= MAX_NAME_SERVERS_LENGTH ) {
				return false;
			} else if ( index < MIN_NAME_SERVERS_LENGTH ) {
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
				label={ sprintf(
					/* translators: %s is the name of the service like: WordPress.com */
					__( 'Use %s name servers' ),
					getServiceName( instanceType )
				) }
				checked={ useWpcomNameservers }
				disabled={ isBusy }
				onChange={ () => {
					const willUseWpcom = ! useWpcomNameservers;
					const newFields = willUseWpcom
						? WPCOM_DEFAULT_NAME_SERVERS.map( ( ns ) => ( {
								value: ns.toUpperCase(),
								error: '',
								touched: false,
						  } ) )
						: Array.from( { length: MAX_NAME_SERVERS_LENGTH }, () => ( {
								value: '',
								error: '',
								touched: false,
						  } ) );

					setUseWpcomNameservers( willUseWpcom );
					setNameServerFields( newFields );
				} }
			/>
			{ showUpsellNudge && <UpsellNudge domainName={ domainName } /> }
			{ queryError && <Notice variant="error">{ queryError }</Notice> }
			{ ! queryError && (
				<>
					{ ! useWpcomNameservers && (
						<Text>
							{ createInterpolateElement(
								/* translators: <link> will be replaced with an anchor tag to open the support article in a new tab */
								__( '<link>Look up</link> the name servers for popular hosts.' ),
								{
									link: (
										<a
											href={ CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								}
							) }
						</Text>
					) }
					{ Array.from(
						{ length: MAX_NAME_SERVERS_LENGTH },
						( _, index ) =>
							nameServerFields[ index ] &&
							shouldShowNextInput( index ) && (
								<NameServerInput
									key={ index }
									index={ index }
									field={ nameServerFields[ index ] }
									disabled={ useWpcomNameservers || !! isBusy }
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
							isBusy={ isBusy }
							onClick={ () =>
								onSubmit(
									nameServerFields.filter( ( ns ) => ns.value !== '' ).map( ( ns ) => ns.value )
								)
							}
						>
							{ __( 'Save' ) }
						</Button>
					</View>
				</>
			) }
		</VStack>
	);
}
