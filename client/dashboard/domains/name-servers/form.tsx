import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	RadioControl,
} from '@wordpress/components';
import { Field, DataForm, NormalizedField, useFormValidity } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useCallback, useMemo } from 'react';
import { useAnalytics } from '../../app/analytics';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { MIN_NAME_SERVERS_LENGTH, MAX_NAME_SERVERS_LENGTH, FormData, NameServerKey } from './types';
import UpsellNudge from './upsell-nudge';
import { validateHostname } from './utils';

const EMPTY_DEFAULT_NAME_SERVERS: string[] = [];

const createNameServerField = ( index: number, formData: FormData, isBusy?: boolean ) => {
	const baseField = {
		id: `nameServer${ index }` as NameServerKey,
		type: 'text' as const,
		label: sprintf(
			// translators: %s is the name server number (1-4)
			__( 'Name server %s' ),
			String( index )
		),
		placeholder: sprintf(
			// translators: %s is the name server number (1-4)
			__( 'ns%s.example.com' ),
			String( index )
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
			// WP.com name servers are listed as text, not as fields
			if ( item.useWpcomNameServers ) {
				return false;
			}

			// For custom nameservers, show fields 3 and 4 only if previous field has value
			if ( index > MIN_NAME_SERVERS_LENGTH ) {
				return Boolean( item[ `nameServer${ index - 1 }` as NameServerKey ] );
			}

			// Always show MIN_NAME_SERVERS_LENGTH fields
			return true;
		},
	};

	return isBusy
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
	defaultNameServers: string[];
	isUsingDefaultNameServers?: boolean;
	isBusy?: boolean;
	onSubmit: ( nameServers: string[] ) => void;
}

export default function NameServersForm( {
	domainName,
	domainSiteSlug,
	showUpsellNudge,
	nameServers = [],
	defaultNameServers = EMPTY_DEFAULT_NAME_SERVERS,
	isUsingDefaultNameServers = false,
	isBusy,
	onSubmit,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();
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

	// Separate memo (no formData dep) keeps the Edit reference stable across
	// keystrokes, so DataForm doesn't remount it and reload the UpsellNudge image.
	const wpcomNameServersField = useMemo< Field< FormData > >(
		() => ( {
			id: 'useWpcomNameServers',
			label: __( 'Where this domain name points' ),
			type: 'boolean',
			Edit: ( { field, onChange, data } ) => {
				return (
					<VStack spacing={ 4 }>
						<RadioControl
							label={ field.label }
							hideLabelFromVision
							selected={ data.useWpcomNameServers ? 'wpcom' : 'custom' }
							disabled={ isBusy }
							options={ [
								{
									label: __( 'WordPress.com name servers' ),
									value: 'wpcom',
									description: __(
										'Your site, email and DNS records are managed here. Nothing to set up.'
									),
								},
								{
									label: __( 'Custom name servers' ),
									value: 'custom',
									description: __( 'Enter the servers another provider gave you.' ),
								},
							] }
							onChange={ ( selected ) => {
								const value = selected === 'wpcom';

								// Track name server type change
								recordTracksEvent(
									'calypso_dashboard_domain_management_name_servers_wpcom_name_servers_toggle_button_click',
									{
										domain: domainName,
										enabled: value,
									}
								);

								// Create nameServer fields dynamically
								const ns = Object.fromEntries(
									Array.from( { length: MAX_NAME_SERVERS_LENGTH }, ( _, i ) => [
										`nameServer${ i + 1 }` as NameServerKey,
										value ? ( defaultNameServers[ i ] ?? '' ) : '',
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
					</VStack>
				);
			},
		} ),
		[ isBusy, showUpsellNudge, domainName, domainSiteSlug, recordTracksEvent, defaultNameServers ]
	);

	const fields = useMemo(
		(): Field< FormData >[] => [
			wpcomNameServersField,
			...Array.from( { length: MAX_NAME_SERVERS_LENGTH }, ( _, i ) =>
				createNameServerField( i + 1, formData, isBusy )
			),
		],
		[ wpcomNameServersField, formData, isBusy ]
	);

	const handleSubmit = useCallback(
		( e: React.FormEvent ) => {
			e.preventDefault();
			onSubmit( getFormNameServers( formData ) );
		},
		[ onSubmit, formData ]
	);

	const { isValid } = useFormValidity( formData, fields, form );

	const canSubmit = ! isBusy && isValid && isNameServersChanged( formData, nameServers );

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
				{ formData.useWpcomNameServers ? (
					<VStack spacing={ 2 }>
						{ getFormNameServers( formData ).map( ( nameServer, index ) => (
							<Text key={ index }>{ nameServer }</Text>
						) ) }
					</VStack>
				) : (
					<>
						<Text>
							{ createInterpolateElement(
								/* translators: <link> will be replaced with an anchor tag to open the support article in a new tab */
								__(
									'Not sure what to enter? <link>Look up</link> the name servers for popular hosts.'
								),
								{
									link: (
										<InlineSupportLink
											supportContext="change-name-servers-finding-out-new-ns"
											onClick={ () => {
												recordTracksEvent(
													'calypso_dashboard_domain_management_name_servers_wpcom_name_servers_look_up_click',
													{
														domain: domainName,
													}
												);
											} }
										/>
									),
								}
							) }
						</Text>
						{ isUsingDefaultNameServers && (
							<Notice>
								{ __(
									'After you save, the new host is in charge of this domain. Your WordPress.com site and email will stop working at this address.'
								) }
							</Notice>
						) }
					</>
				) }
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
