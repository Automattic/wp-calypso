import { CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS } from '@automattic/urls';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	ToggleControl,
} from '@wordpress/components';
import { Field, DataForm, NormalizedField } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useCallback, useMemo } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import {
	MIN_NAME_SERVERS_LENGTH,
	MAX_NAME_SERVERS_LENGTH,
	WPCOM_DEFAULT_NAME_SERVERS,
	NameServerKey,
} from './types';
import UpsellNudge from './upsell-nudge';
import { areAllWpcomNameServers, validateHostname } from './utils';

type FormData = {
	useWpcomNameServers: boolean;
} & {
	[ K in NameServerKey ]: string;
};

interface Props {
	domainName: string;
	showUpsellNudge?: boolean;
	nameServers?: string[];
	isBusy?: boolean;
	onSubmit: ( nameServers: string[] ) => void;
}

export default function NameServersForm( {
	domainName,
	showUpsellNudge,
	nameServers = [],
	isBusy,
	onSubmit,
}: Props ) {
	const isWpcomNameservers = areAllWpcomNameServers( nameServers );
	const [ formData, setFormData ] = useState< FormData >( () => {
		// Start with a partial object
		const initialData = {
			useWpcomNameServers: isWpcomNameservers,
		} as Partial< FormData >;

		// Add all nameServer fields
		for ( let i = 0; i < MAX_NAME_SERVERS_LENGTH; i++ ) {
			const key = `nameServer${ i + 1 }` as NameServerKey;
			initialData[ key ] = nameServers[ i ]?.toLowerCase() || '';
		}

		// Assert the object is now complete
		return initialData as FormData;
	} );

	const formObj = useMemo(
		() => ( {
			fields: [
				'useWpcomNameServers',
				...Array.from(
					{ length: MAX_NAME_SERVERS_LENGTH },
					( _, i ) => `nameServer${ i + 1 }` as NameServerKey
				),
			],
		} ),
		[]
	);

	const createNameServerField = useCallback(
		( index: number ) => {
			const baseField = {
				id: `nameServer${ index }` as NameServerKey,
				type: 'text' as const,
				label: sprintf(
					// translators: %s is the name server number (1-4)
					__( 'Custom name server %s' ),
					index
				),
				placeholder: sprintf(
					// translators: %s is the name server number (1-4)
					__( 'ns%s.domain.com' ),
					index
				),
				isValid: {
					required: index <= MIN_NAME_SERVERS_LENGTH,
					custom: ( formData: FormData, field: NormalizedField< FormData > ) => {
						const value = formData[ field.id as NameServerKey ];
						// Skip validation for empty optional fields
						if ( ! value && ! field.isValid?.required ) {
							return '';
						}
						return validateHostname( value ) ? '' : __( 'Please enter a valid hostname' );
					},
				},
				isVisible: ( item: FormData ) => {
					// For WP.com nameservers, show field only if it has a value
					if ( item.useWpcomNameServers ) {
						return Boolean( item[ `nameServer${ index }` as NameServerKey ] );
					}

					// For custom nameservers, show fields 3 and 4 only if previous field has value
					if ( index > MIN_NAME_SERVERS_LENGTH ) {
						return Boolean( item[ `nameServer${ index - 1 }` as NameServerKey ] );
					}

					// Always show MIN_NAME_SERVERS_LENGTH fields
					return true;
				},
			};

			return formData.useWpcomNameServers || isBusy
				? {
						...baseField,
						Edit: ( { field }: { field: Field< FormData > } ) => (
							<InputControl
								__next40pxDefaultSize
								disabled
								label={ field.label }
								value={ formData[ field.id as NameServerKey ]?.toLowerCase() }
							/>
						),
				  }
				: baseField;
		},
		[ formData, isBusy ]
	);

	const fields = useMemo(
		(): Field< FormData >[] => [
			{
				id: 'useWpcomNameServers',
				label: __( 'Use WordPress.com name servers' ),
				type: 'boolean',
				Edit: ( { onChange, data } ) => {
					return (
						<VStack spacing={ 4 }>
							<ToggleControl
								label={ __( 'Use WordPress.com name servers' ) }
								checked={ data.useWpcomNameServers }
								disabled={ isBusy }
								onChange={ ( value ) => {
									// Create nameServer fields dynamically
									const ns = Object.fromEntries(
										Array.from( { length: MAX_NAME_SERVERS_LENGTH }, ( _, i ) => [
											`nameServer${ i + 1 }` as NameServerKey,
											value ? WPCOM_DEFAULT_NAME_SERVERS[ i ] : '',
										] )
									);

									onChange( {
										useWpcomNameServers: value,
										...ns,
									} );
								} }
							/>
							{ showUpsellNudge && <UpsellNudge domainName={ domainName } /> }
							{ ! data.useWpcomNameServers && (
								<Text>
									{ createInterpolateElement(
										/* translators: <link> will be replaced with an anchor tag to open the support article in a new tab */
										__( '<link>Look up</link> the name servers for popular hosts.' ),
										{
											link: (
												<InlineSupportLink supportLink={ CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS } />
											),
										}
									) }
								</Text>
							) }
						</VStack>
					);
				},
			},
			...Array.from( { length: MAX_NAME_SERVERS_LENGTH }, ( _, i ) =>
				createNameServerField( i + 1 )
			),
		],
		[ createNameServerField, isBusy, showUpsellNudge, domainName ]
	);

	const handleSubmit = useCallback(
		( e: React.FormEvent ) => {
			e.preventDefault();

			// Get all nameServer values dynamically
			const nameServerValues = Array.from(
				{ length: MAX_NAME_SERVERS_LENGTH },
				( _, i ) => formData[ `nameServer${ i + 1 }` as NameServerKey ]
			).filter( Boolean );
			onSubmit( nameServerValues );
		},
		[ formData, onSubmit ]
	);

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<DataForm< FormData >
					data={ formData }
					fields={ fields }
					form={ formObj }
					onChange={ ( value ) => {
						setFormData( ( data ) => ( { ...data, ...value } ) );
					} }
				/>
				<div>
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
						disabled={ isBusy }
						isBusy={ isBusy }
					>
						{ __( 'Save' ) }
					</Button>
				</div>
			</VStack>
		</form>
	);
}
