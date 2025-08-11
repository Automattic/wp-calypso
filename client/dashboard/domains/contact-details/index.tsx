import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { get } from 'lodash';
import { countryListQuery } from '../../app/queries/domain';
import { domainWhoisQuery } from '../../app/queries/domain-whois';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { fetchDomainWhoisValidate, updateDomainWhois } from '../../data/domain-whois';
import { findRegistrantWhois } from '../../utils/domain-whois';
import ContactForm from './contact-form';
import { DomainContactDetails } from './types';

import './style.scss';

export default function DomainContactInfo() {
	const { domainName } = domainRoute.useParams();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: whoisData } = useQuery( domainWhoisQuery( domainName ) );
	const { data: countryList } = useQuery( countryListQuery() );
	const registrantWhoisData = findRegistrantWhois( whoisData );
	const formDataRef = useRef< any >( null );

	const updateMutation = useMutation( {
		mutationFn: ( formData: any ) => updateDomainWhois( domainName, formData, false ),
		onSuccess: () => {
			createSuccessNotice( __( 'Contact details saved.' ), { type: 'snackbar' } );
			navigate( { to: '/domains/$domainName', params: { domainName } } );
			queryClient.invalidateQueries( { queryKey: [ 'domains', domainName, 'whois' ] } );
		},
		onError: () => {
			createErrorNotice( __( 'Failed to save contact details.' ), {
				type: 'snackbar',
			} );
		},
	} );

	const validateMutation = useMutation( {
		mutationFn: ( formData: any ) => {
			formDataRef.current = formData;
			return fetchDomainWhoisValidate( domainName, formData );
		},
		onSuccess: ( data: any ) => {
			if ( data.success ) {
				updateMutation.mutate( formDataRef.current );
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
					countryList={ countryList ?? [] }
					onSubmit={ handleSubmit }
					onCancel={ handleCancel }
					errors={ {} }
				/>
			</div>
		</PageLayout>
	);
}
