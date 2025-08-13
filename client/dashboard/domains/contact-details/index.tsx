import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { get } from 'lodash';
import { domainWhoisQuery, updateDomainWhoisMutation } from '../../app/queries/domain-whois';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { fetchDomainWhoisValidate } from '../../data/domain-whois';
import { findRegistrantWhois } from '../../utils/domain-whois';
import ContactForm from './contact-form';
import { DomainContactDetails } from './types';

import './style.scss';

export default function DomainContactInfo() {
	const { domainName } = domainRoute.useParams();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const navigate = useNavigate();
	const { data: whoisData } = useQuery( domainWhoisQuery( domainName ) );

	const registrantWhoisData = findRegistrantWhois( whoisData );
	const formDataRef = useRef< any >( null );
	const updateMutation = useMutation( updateDomainWhoisMutation( domainName ) );

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
							navigate( { to: '/domains/$domainName', params: { domainName } } );
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

	const handleSubmit = ( formData: any ) => {
		validateMutation.mutate( formData );
	};

	const handleCancel = () => {
		navigate( { to: '/domains/$domainName', params: { domainName } } );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Contact details' ) } /> }>
			<div className="domain-contact-info">
				<ContactForm
					isSubmitting={ validateMutation.isPending || updateMutation.isPending }
					initialData={
						{
							firstName: get( registrantWhoisData, 'fname' ),
							lastName: get( registrantWhoisData, 'lname' ),
							organization: get( registrantWhoisData, 'org' ),
							email: get( registrantWhoisData, 'email' ),
							phone: get( registrantWhoisData, 'phone' ),
							address1: get( registrantWhoisData, 'sa1' ),
							address2: get( registrantWhoisData, 'sa2' ),
							city: get( registrantWhoisData, 'city' ),
							state: get( registrantWhoisData, 'state' ),
							countryCode: get( registrantWhoisData, 'country_code' ),
							postalCode: get( registrantWhoisData, 'pc' ),
							fax: get( registrantWhoisData, 'fax' ),
						} as DomainContactDetails
					}
					onSubmit={ handleSubmit }
					onCancel={ handleCancel }
					errors={ {} }
				/>
			</div>
		</PageLayout>
	);
}
