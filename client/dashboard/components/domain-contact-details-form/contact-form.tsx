import { type DomainContactDetails } from '@automattic/api-core';
import { countryListQuery, statesListQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { DataForm, Field, useFormValidity, FormField } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../button-stack';
import { Card, CardBody } from '../card';
import InlineSupportLink from '../inline-support-link';
import Notice from '../notice';
import { getContactFormFields } from './contact-form-fields';
import { RegionAddressFieldsLayout } from './region-address-fieldsets';

interface ContactFormProps {
	initialData?: DomainContactDetails;
	beforeForm?: React.ReactNode;
	isSubmitting: boolean;
	onSubmit: ( normalizedFormData: DomainContactDetails ) => void;
}

export default function ContactForm( {
	initialData,
	isSubmitting,
	beforeForm,
	onSubmit,
}: ContactFormProps ) {
	const { data: countryList } = useQuery( countryListQuery() );
	const [ formData, setFormData ] = useState< DomainContactDetails >(
		initialData ?? { optOutTransferLock: false }
	);
	const selectedCountryCode = formData.countryCode ?? initialData?.countryCode ?? '';
	const { data: statesList } = useQuery( statesListQuery( selectedCountryCode ) );

	const normalizedFormData = useMemo( () => {
		if ( ! statesList || statesList.length === 0 ) {
			return formData;
		}

		// If current state is not in the statesList, use the first available state
		const isValidState = statesList.some( ( state ) => state.code === formData.state );
		if ( formData.state && ! isValidState ) {
			return { ...formData, state: statesList[ 0 ]?.code };
		}

		return formData;
	}, [ formData, statesList ] );

	const isDirty = ! ( JSON.stringify( normalizedFormData ) === JSON.stringify( initialData ) );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onSubmit( normalizedFormData );
	};

	const fields: Field< DomainContactDetails >[] = useMemo(
		() => getContactFormFields( countryList ?? [], statesList ?? [], selectedCountryCode ),
		[ countryList, statesList, selectedCountryCode ]
	);

	const form = {
		layout: { type: 'regular' as const },
		fields: [
			{
				id: 'name-row',
				layout: {
					type: 'row' as const,
					alignment: 'start' as const,
				},
				children: [ 'firstName', 'lastName' ],
			} as FormField,
			'organization',
			'email',
			'phone',
			'countryCode',
			...RegionAddressFieldsLayout( {
				statesList,
				countryList,
				countryCode: selectedCountryCode,
			} ),
			'optOutTransferLock',
		],
	};

	const { isValid: canSave } = useFormValidity( normalizedFormData, fields, form );

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
					</Text>
				</VStack>
			</Notice>

			{ beforeForm }

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<DataForm< DomainContactDetails >
							data={ normalizedFormData }
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
											'By clicking <strong>Save</strong>, you agree to the applicable <agreementlink>Domain Registration Agreement</agreementlink> and confirm that the Transferee has agreed in writing to be bound by the same agreement. You authorize the respective registrar to act as your <agentlink>Designated Agent</agentlink>.'
										),
										{
											strong: <strong />,
											agreementlink: (
												<ExternalLink href="https://wordpress.com/automattic-domain-name-registration-agreement/">
													{ __( 'Domain Registration Agreement' ) }
												</ExternalLink>
											),
											agentlink: <InlineSupportLink supportContext="domain-designated-agent" />,
										}
									) }
								</Text>
							</VStack>
						</Notice>
						<form onSubmit={ handleSubmit }>
							<ButtonStack justify="flex-start">
								<Button
									__next40pxDefaultSize
									variant="primary"
									type="submit"
									isBusy={ isSubmitting }
									disabled={ ! canSave || ! isDirty || isSubmitting }
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
						</form>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
