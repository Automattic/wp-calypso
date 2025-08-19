import { useMutation, useQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef, useState, useMemo } from 'react';
import { countryListQuery, statesListQuery } from '../../app/queries/domain-supported-contries';
import { domainWhoisMutation } from '../../app/queries/domain-whois';
import Notice from '../../components/notice';
import { fetchDomainWhoisValidate, type DomainContactDetails } from '../../data/domain-whois';
import { getContactFormFields } from './contact-form-fields';

interface ContactFormProps {
	domainName: string;
	initialData?: DomainContactDetails;
	onSubmit?: ( data: DomainContactDetails ) => void;
	onCancel?: () => void;
	errors?: Partial< Record< keyof DomainContactDetails, string > >;
}

export default function ContactForm( {
	domainName,
	initialData,
	onSubmit,
	onCancel,
}: ContactFormProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: countryList } = useQuery( countryListQuery() );
	const [ selectedCountryCode, setSelectedCountryCode ] = useState(
		initialData?.countryCode ?? ''
	);
	const { data: statesList } = useQuery( statesListQuery( selectedCountryCode ) );

	const formDataRef = useRef< any >( null );
	const updateMutation = useMutation( domainWhoisMutation( domainName ) );

	const validateMutation = useMutation( {
		mutationFn: ( formData: any ) => {
			formDataRef.current = formData;
			return fetchDomainWhoisValidate( domainName, formData );
		},
		onSuccess: ( data: any ) => {
			if ( data.success ) {
				updateMutation.mutate(
					{
						formData: formDataRef.current,
						transferLock: formDataRef.current.optOutTransferLock === false,
					},
					{
						onSuccess: () => {
							createSuccessNotice( __( 'Contact details saved.' ), { type: 'snackbar' } );
							onSubmit?.( formDataRef.current );
						},
						onError: () => {
							createErrorNotice( __( 'Failed to save contact details.' ), {
								type: 'snackbar',
							} );
						},
					}
				);
			} else {
				createErrorNotice( data.messages_simple, {
					type: 'snackbar',
				} );
			}
		},
	} );

	const [ formData, setFormData ] = useState< DomainContactDetails >(
		initialData ?? { optOutTransferLock: false }
	);

	const isDirty = ! ( JSON.stringify( formData ) === JSON.stringify( initialData ) );
	const isSubmitting = validateMutation.isPending || updateMutation.isPending;

	const handleSubmit = () => {
		validateMutation.mutate( formData );
	};

	useEffect( () => {
		if ( formData.countryCode ) {
			setSelectedCountryCode( formData.countryCode as string );
		}
	}, [ formData.countryCode, setSelectedCountryCode ] );

	const fields: Field< DomainContactDetails >[] = useMemo(
		() => getContactFormFields( countryList ?? [], statesList ?? [] ),
		[ countryList, statesList ]
	);

	const form = {
		type: 'regular' as const,
		labelPosition: 'top' as const,
		fields: [
			'firstName',
			'lastName',
			'organization',
			'email',
			'phone',
			'countryCode',
			'address1',
			'address2',
			'city',
			'state',
			'postalCode',
			'optOutTransferLock',
		],
	};

	const canSave = isItemValid( formData, fields, form );

	return (
		<VStack spacing={ 10 }>
			<Notice>
				<VStack>
					<Text as="p">{ __( 'Provide accurate contact information' ) }</Text>
					<Text as="p">
						{ createInterpolateElement(
							sprintf(
								/* translators: %1$s: ICANN acronym */
								__(
									'<external>%s</external> requires accurate contact information for registrants. This information will be validated after purchase. Failure to validate your contact information will result in domain suspension.'
								),
								'ICANN'
							),
							{
								external: (
									<Button
										variant="link"
										target="_blank"
										href="https://www.icann.org/resources/pages/contact-verification-2013-05-03-en"
									>
										ICANN
									</Button>
								),
							}
						) }
					</Text>
					<Text as="p">
						{ __( 'Domain privacy service is included for free on applicable domains.' ) }{ ' ' }
						<ExternalLink
							// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
							href="https://wordpress.com/support/domains/private-domain-registration/#what-is-privacy-protection"
						>
							{ __( 'Learn more' ) }
						</ExternalLink>
						.
					</Text>
				</VStack>
			</Notice>

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<DataForm< DomainContactDetails >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< DomainContactDetails > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<Notice>
							<VStack>
								<Text as="p">
									{ createInterpolateElement(
										__(
											'By clicking <strong>Save contact info</strong>, you agree to the applicable <agreementlink>Domain Registration Agreement</agreementlink> and confirm that the Transferee has agreed in writing to be bound by the same agreement. You authorize the respective registrar to act as your <agentlink>Designated Agent</agentlink>.'
										),
										{
											strong: <strong />,
											agreementlink: (
												<a
													// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
													href="https://wordpress.com/automattic-domain-name-registration-agreement/"
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
											agentlink: (
												<a
													// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
													href="https://wordpress.com/support/domains/update-contact-information/#designated-agent"
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										}
									) }
								</Text>
							</VStack>
						</Notice>
						<HStack justify="flex-start" spacing={ 2 }>
							<Button
								onClick={ () => handleSubmit( formData ) }
								variant="primary"
								type="submit"
								isBusy={ isSubmitting }
								disabled={ ! canSave || ! isDirty || isSubmitting }
							>
								{ __( 'Save contact info' ) }
							</Button>
							<Button variant="secondary" onClick={ onCancel }>
								{ __( 'Cancel' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
