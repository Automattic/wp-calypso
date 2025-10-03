import { CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS } from '@automattic/urls';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	ToggleControl,
} from '@wordpress/components';
import { Field, DataForm, NormalizedField, isItemValid } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useCallback, useMemo } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import {
	MIN_NAME_SERVERS_LENGTH,
	MAX_NAME_SERVERS_LENGTH,
	WPCOM_DEFAULT_NAME_SERVERS,
	FormData,
	NameServerKey,
} from './types';
import UpsellNudge from './upsell-nudge';
import { validateHostname } from './utils';

const createNameServerField = ( index: number, formData: FormData, isBusy?: boolean ) => {
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
					return null;
				}
				return validateHostname( value ) ? null : __( 'Please enter a valid hostname' );
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
};

const getFormNameServers = ( { useWpcomNameServers, ...nameServers }: FormData ) =>
	Object.values( nameServers ).filter( Boolean );

const isNameServersChanged = ( formData: FormData, nameServers: string[] ) => {
	const currentNameServers = getFormNameServers( formData );
	// Different lengths means there's definitely a change
	if ( currentNameServers.length !== nameServers.length ) {
		return true;
	}
	// Check if every nameserver matches in the same position
	return currentNameServers.some(
		( ns, index ) => ns.toLowerCase() !== ( nameServers[ index ] || '' ).toLowerCase()
	);
};

interface Props {
	domainName: string;
	domainSiteSlug: string;
	showUpsellNudge?: boolean;
	nameServers?: string[];
	isUsingDefaultNameServers?: boolean;
	isBusy?: boolean;
	onSubmit: ( nameServers: string[] ) => void;
}

export default function NameServersForm( {
	domainName,
	domainSiteSlug,
	showUpsellNudge,
	nameServers = [],
	isUsingDefaultNameServers = false,
	isBusy,
	onSubmit,
}: Props ) {
	const [ formData, setFormData ] = useState< FormData >( () => {
		// Start with a partial object
		const initialData = {
			useWpcomNameServers: isUsingDefaultNameServers,
		} as Partial< FormData >;

		// Add all nameServer fields
		for ( let i = 0; i < MAX_NAME_SERVERS_LENGTH; i++ ) {
			const key = `nameServer${ i + 1 }` as NameServerKey;
			initialData[ key ] = nameServers[ i ]?.toLowerCase() || '';
		}

		// Assert the object is now complete
		return initialData as FormData;
	} );

	const form = useMemo(
		() => ( {
			layout: { type: 'regular' as const },
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
							{ showUpsellNudge && (
								<UpsellNudge domainName={ domainName } domainSiteSlug={ domainSiteSlug } />
							) }
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
				createNameServerField( i + 1, formData, isBusy )
			),
		],
		[ formData, isBusy, showUpsellNudge, domainName, domainSiteSlug ]
	);

	const handleSubmit = useCallback(
		( e: React.FormEvent ) => {
			e.preventDefault();
			onSubmit( getFormNameServers( formData ) );
		},
		[ onSubmit, formData ]
	);

	const canSubmit =
		! isBusy &&
		isItemValid( formData, fields, form ) &&
		isNameServersChanged( formData, nameServers );

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<DataForm< FormData >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( value ) => {
						setFormData( ( data ) => ( { ...data, ...value } ) );
					} }
				/>
				<div>
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
						disabled={ ! canSubmit }
						isBusy={ isBusy }
					>
						{ __( 'Save' ) }
					</Button>
				</div>
			</VStack>
		</form>
	);
}
