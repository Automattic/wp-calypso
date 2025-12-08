import {
	domainPrivacyDisableMutation,
	domainPrivacyDiscloseMutation,
	domainPrivacyEnableMutation,
	domainPrivacyRedactMutation,
	domainQuery,
	domainWhoisValidateMutation,
	domainWhoisMutation,
	domainWhoisQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
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
	const { data: whoisData } = useQuery( { ...domainWhoisQuery( domainName ), staleTime: 0 } );
	const registrantWhoisData = findRegistrantWhois( whoisData );

	const { initialData, key } = useMemo( () => {
		const initialData = {
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
			optOutTransferLock: false,
		};

		return { initialData, key: JSON.stringify( initialData ) };
	}, [ registrantWhoisData ] );

	const validateMutation = useMutation( {
		...domainWhoisValidateMutation( [ domainName ] ),
		meta: { snackbar: { error: { source: 'server' } } },
	} );
	const updateMutation = useMutation( {
		...domainWhoisMutation( domainName ),
		meta: { snackbar: { error: { source: 'server' } } },
	} );
	const enablePrivacyMutation = useMutation( {
		...domainPrivacyEnableMutation( domainName ),
		meta: { snackbar: { error: { source: 'server' } } },
	} );
	const disablePrivacyMutation = useMutation( {
		...domainPrivacyDisableMutation( domainName ),
		meta: { snackbar: { error: { source: 'server' } } },
	} );
	const disclosePrivacyMutation = useMutation( {
		...domainPrivacyDiscloseMutation( domainName ),
		meta: { snackbar: { error: { source: 'server' } } },
	} );
	const redactPrivacyMutation = useMutation( {
		...domainPrivacyRedactMutation( domainName ),
		meta: { snackbar: { error: { source: 'server' } } },
	} );

	const isSubmitting =
		validateMutation.isPending ||
		updateMutation.isPending ||
		enablePrivacyMutation.isPending ||
		disablePrivacyMutation.isPending ||
		disclosePrivacyMutation.isPending ||
		redactPrivacyMutation.isPending;

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
						}
					);
				} else {
					createErrorNotice( data.messages_simple.join( ' ' ), {
						type: 'snackbar',
					} );
				}
			},
		} );
	};

	const handleTogglePrivacyProtection = () => {
		if ( domain.private_domain ) {
			disablePrivacyMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Privacy has been successfully disabled!' ), {
						type: 'snackbar',
					} );
				},
			} );
		} else {
			enablePrivacyMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Privacy has been successfully enabled!' ), {
						type: 'snackbar',
					} );
				},
			} );
		}
	};

	const handleTogglePrivacyDisclosure = () => {
		if ( domain.contact_info_disclosed ) {
			redactPrivacyMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Your contact information is now redacted!' ), {
						type: 'snackbar',
					} );
				},
			} );
		} else {
			disclosePrivacyMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Your contact information is now publicly visible!' ), {
						type: 'snackbar',
					} );
				},
			} );
		}
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					description={ __( "Update your domain's contact information for registration." ) }
				/>
			}
		>
			<ContactForm
				isSubmitting={ isSubmitting }
				onSubmit={ handleSubmit }
				beforeForm={
					! domain.is_hundred_year_domain && (
						<Card>
							<CardBody>
								<ContactFormPrivacy
									domainName={ domainName }
									isSubmitting={ isSubmitting }
									onTogglePrivacyProtection={ handleTogglePrivacyProtection }
									onTogglePrivacyDisclosure={ handleTogglePrivacyDisclosure }
								/>
							</CardBody>
						</Card>
					)
				}
				key={ key }
				initialData={ initialData }
				validate={ validateMutation.mutateAsync }
			/>
		</PageLayout>
	);
}
