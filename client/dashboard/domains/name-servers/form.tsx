import { CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS } from '@automattic/urls';
import {
	Button,
	__experimentalText as Text,
	__experimentalView as View,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	ToggleControl,
} from '@wordpress/components';
import { Field, DataForm, NormalizedField } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { MIN_NAME_SERVERS_LENGTH, WPCOM_DEFAULT_NAME_SERVERS } from './types';
import UpsellNudge from './upsell-nudge';
import { areAllWpcomNameServers, validateHostname } from './utils';

type FormData = {
	useWpcomNameServers: boolean;
	nameServer1: string;
	nameServer2: string;
	nameServer3: string;
	nameServer4: string;
};

interface Props {
	domainName: string;
	showUpsellNudge?: boolean;
	nameServers?: string[];
	isBusy?: boolean;
	queryError?: string;
	onSubmit: ( nameServers: string[] ) => void;
}

export default function NameServersForm( {
	domainName,
	showUpsellNudge,
	nameServers = [],
	isBusy,
	queryError,
	onSubmit,
}: Props ) {
	const isWpcomNameservers = areAllWpcomNameServers( nameServers );
	const [ formData, setFormData ] = useState< FormData >( {
		useWpcomNameServers: isWpcomNameservers,
		nameServer1: nameServers[ 0 ],
		nameServer2: nameServers[ 1 ],
		nameServer3: nameServers[ 2 ],
		nameServer4: nameServers[ 3 ],
	} );

	const formObj = {
		fields: [ 'useWpcomNameServers', 'nameServer1', 'nameServer2', 'nameServer3', 'nameServer4' ],
	};

	const createNameServerField = ( index: number ) => {
		type NameServerKey = `nameServer${ 1 | 2 | 3 | 4 }`;
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

				// For custom nameservers, show field 3 and 4 only if previous field has value
				if ( index > 2 ) {
					return Boolean( item[ `nameServer${ index - 1 }` as NameServerKey ] );
				}

				// Always show fields 1 and 2
				return true;
			},
		};

		return formData.useWpcomNameServers
			? {
					...baseField,
					Edit: ( { field }: { field: Field< FormData > } ) => (
						<InputControl
							__next40pxDefaultSize
							disabled
							label={ field.label }
							value={ formData[ field.id as NameServerKey ] }
						/>
					),
			  }
			: baseField;
	};

	const fields: Field< FormData >[] = [
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
							onChange={ ( value ) => {
								const ns = {
									nameServer1: value ? WPCOM_DEFAULT_NAME_SERVERS[ 0 ] : '',
									nameServer2: value ? WPCOM_DEFAULT_NAME_SERVERS[ 1 ] : '',
									nameServer3: value ? WPCOM_DEFAULT_NAME_SERVERS[ 2 ] : '',
									nameServer4: value ? WPCOM_DEFAULT_NAME_SERVERS[ 3 ] : '',
								};

								onChange( {
									useWpcomNameServers: value,
									...ns,
								} );
							} }
						/>
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
		createNameServerField( 1 ),
		createNameServerField( 2 ),
		createNameServerField( 3 ),
		createNameServerField( 4 ),
	];

	return (
		<form
			onSubmit={ ( e ) => {
				e.preventDefault();
				onSubmit(
					[
						formData.nameServer1,
						formData.nameServer2,
						formData.nameServer3,
						formData.nameServer4,
					].filter( Boolean )
				);
			} }
		>
			<VStack spacing={ 4 }>
				{ showUpsellNudge && <UpsellNudge domainName={ domainName } /> }
				{ queryError && <Notice variant="error">{ queryError }</Notice> }
				{ ! queryError && (
					<VStack spacing={ 4 }>
						<DataForm< FormData >
							data={ formData }
							fields={ fields }
							form={ formObj }
							onChange={ ( value ) => {
								setFormData( ( data ) => ( { ...data, ...value } ) );
							} }
						/>
						<View>
							<Button __next40pxDefaultSize variant="primary" type="submit" isBusy={ isBusy }>
								{ __( 'Save' ) }
							</Button>
						</View>
					</VStack>
				) }
			</VStack>
		</form>
	);
}
