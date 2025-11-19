import {
	domainQuery,
	domainWhoisValidateMutation,
	domainWhoisMutation,
	domainWhoisQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute } from '../../app/router/domains';
import { Card, CardBody } from '../../components/card';
import ContactForm from '../../components/domain-contact-details-form/contact-form';
import ContactFormPrivacy from '../../components/domain-contact-details-form/contact-form-privacy';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { findRegistrantWhois } from '../../utils/domain';
import type { DomainContactDetails } from '@automattic/api-core';

export default function DomainContactInfo() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: whoisData } = useQuery( domainWhoisQuery( domainName ) );
	const registrantWhoisData = findRegistrantWhois( whoisData );

	const validateMutation = useMutation( domainWhoisValidateMutation( [ domainName ] ) );
	const updateMutation = useMutation( domainWhoisMutation( domainName ) );

	const isSubmitting = validateMutation.isPending || updateMutation.isPending;

	const handleSubmit = ( normalizedFormData: DomainContactDetails ) => {
		validateMutation.mutate( normalizedFormData, {
			onSuccess: ( data ) => {
				if ( data.success ) {
					updateMutation.mutate(
						{
							domainContactDetails: normalizedFormData,
							transferLock: normalizedFormData.optOutTransferLock === false,
						},
						{
							onSuccess: () => {
								createSuccessNotice( __( 'Contact details saved.' ), { type: 'snackbar' } );
							},
							onError: ( error: Error ) => {
								createErrorNotice( error.message, {
									type: 'snackbar',
								} );
							},
						}
					);
				} else {
					createErrorNotice( data.messages_simple.join( ' ' ), {
						type: 'snackbar',
					} );
				}
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message, {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<PageLayout size="small" header={ <PageHeader prefix={ <Breadcrumbs length={ 2 } /> } /> }>
			<ContactForm
				isSubmitting={ isSubmitting }
				onSubmit={ handleSubmit }
				beforeForm={
					! domain.is_hundred_year_domain && (
						<Card>
							<CardBody>
								<ContactFormPrivacy domainName={ domainName } />
							</CardBody>
						</Card>
					)
				}
				initialData={
					{
						firstName: registrantWhoisData?.fname ?? '',
						lastName: registrantWhoisData?.lname ?? '',
						organization: registrantWhoisData?.org ?? '',
						email: registrantWhoisData?.email ?? '',
						phone: registrantWhoisData?.phone ?? '',
						address1: registrantWhoisData?.sa1 ?? '',
						address2: registrantWhoisData?.sa2 ?? '',
						city: registrantWhoisData?.city ?? '',
						state: registrantWhoisData?.state ?? '',
						countryCode: registrantWhoisData?.country_code ?? '',
						postalCode: registrantWhoisData?.pc ?? '',
						fax: registrantWhoisData?.fax ?? '',
					} as DomainContactDetails
				}
			/>
		</PageLayout>
	);
}
