import {
	domainPrivacySaveMutation,
	domainPrivacyDiscloseSaveMutation,
	domainQuery,
	domainWhoisValidateMutation,
	domainWhoisMutation,
	domainWhoisQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo } from 'react';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { domainRoute } from '../../app/router/domains';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../components/card';
import {
	isCaDomain,
	mapWhoisExtraToCaContactExtra,
} from '../../components/domain-contact-details-form/ca-contact-fields';
import ContactForm from '../../components/domain-contact-details-form/contact-form';
import ContactFormPrivacy from '../../components/domain-contact-details-form/contact-form-privacy';
import {
	isFrDomain,
	mapWhoisExtraToFrContactExtra,
} from '../../components/domain-contact-details-form/fr-contact-fields';
import {
	isUkDomain,
	mapWhoisExtraToUkContactExtra,
} from '../../components/domain-contact-details-form/uk-contact-fields';
import { findRegistrantWhois } from '../../utils/domain';
import { DomainContactDetailsLayout } from './layout';
import type { DomainContactDetails, DomainContactDetailsExtra } from '@automattic/api-core';

export default function DomainContactInfo() {
	const { createErrorNotice } = useDispatch( noticesStore );

	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: whoisData } = useQuery( { ...domainWhoisQuery( domainName ), staleTime: 0 } );
	const registrantWhoisData = findRegistrantWhois( whoisData );

	const { initialData, key } = useMemo( () => {
		const extra: DomainContactDetailsExtra = {};
		const ukExtra = isUkDomain( domainName )
			? mapWhoisExtraToUkContactExtra( registrantWhoisData?.extra )
			: undefined;
		if ( ukExtra ) {
			extra.uk = ukExtra;
		}
		const frExtra = isFrDomain( domainName )
			? mapWhoisExtraToFrContactExtra( registrantWhoisData?.extra )
			: undefined;
		if ( frExtra ) {
			extra.fr = frExtra;
		}
		const caExtra = isCaDomain( domainName )
			? mapWhoisExtraToCaContactExtra( registrantWhoisData?.extra )
			: undefined;
		if ( caExtra ) {
			extra.ca = caExtra;
		}

		const initialData: DomainContactDetails = {
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
			...( Object.keys( extra ).length > 0 ? { extra } : {} ),
		};

		return { initialData, key: JSON.stringify( initialData ) };
	}, [ registrantWhoisData, domainName ] );

	const validateMutation = useMutation(
		withSnackbar( domainWhoisValidateMutation( [ domainName ] ), { error: { source: 'server' } } )
	);
	const updateMutation = useMutation(
		withSnackbar( domainWhoisMutation( domainName ), {
			/* translators: %s is the domain name */
			success: sprintf( __( 'Contact details for %s saved.' ), domainName ),
			error: { source: 'server' },
		} )
	);
	const savePrivacyMutation = useMutation(
		withSnackbar( domainPrivacySaveMutation( domainName ), {
			/* translators: %s is the domain name */
			success: sprintf( __( 'Privacy has been successfully updated for %s!' ), domainName ),
			error: { source: 'server' },
		} )
	);

	const disclosePrivacyMutation = useMutation(
		withSnackbar( domainPrivacyDiscloseSaveMutation( domainName ), {
			success: sprintf(
				/* translators: %s is the domain name */
				__( 'Your contact information for %s is now publicly visible!' ),
				domainName
			),
			error: { source: 'server' },
		} )
	);
	const redactPrivacyMutation = useMutation(
		withSnackbar( domainPrivacyDiscloseSaveMutation( domainName ), {
			/* translators: %s is the domain name */
			success: sprintf( __( 'Your contact information for %s is now redacted!' ), domainName ),
			error: { source: 'server' },
		} )
	);

	const isSubmitting =
		validateMutation.isPending ||
		updateMutation.isPending ||
		savePrivacyMutation.isPending ||
		disclosePrivacyMutation.isPending ||
		redactPrivacyMutation.isPending;

	const handleSubmit = ( normalizedFormData: DomainContactDetails ) => {
		validateMutation.mutate( normalizedFormData, {
			onSuccess: ( data ) => {
				if ( data.success ) {
					updateMutation.mutate( {
						domainContactDetails: normalizedFormData,
						transferLock: normalizedFormData.optOutTransferLock === false,
					} );
				} else {
					createErrorNotice( data.messages_simple.join( ' ' ), {
						type: 'snackbar',
					} );
				}
			},
		} );
	};

	const handleTogglePrivacyProtection = () => {
		savePrivacyMutation.mutate( domain.private_domain ? false : true );
	};

	const handleTogglePrivacyDisclosure = () => {
		if ( domain.contact_info_disclosed ) {
			redactPrivacyMutation.mutate( false );
		} else {
			disclosePrivacyMutation.mutate( true );
		}
	};

	return (
		<DomainContactDetailsLayout>
			<ContactForm
				domainNames={ [ domainName ] }
				isSubmitting={ isSubmitting }
				onSubmit={ handleSubmit }
				beforeFormCard={
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
			<PerformanceTrackerStop />
		</DomainContactDetailsLayout>
	);
}
