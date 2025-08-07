import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { get } from 'lodash';
import { domainWhoisQuery } from '../../app/queries/domain-whois';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { findRegistrantWhois } from '../../utils/domain-whois';
import ContactForm from './contact-form';

import './style.scss';

export default function DomainContactInfo() {
	const { domainName } = domainRoute.useParams();
	const navigate = useNavigate();
	const { data: whoisData } = useQuery( domainWhoisQuery( domainName ) );
	const registrantWhoisData = findRegistrantWhois( whoisData );

	const handleSubmit = ( formData: any ) => {
		// TODO: Implement form submission
		// Form data will be processed here
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		void formData;
	};

	const handleCancel = () => {
		navigate( { to: '/domains/$domainName', params: { domainName } } );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Contact details' ) } /> }>
			<div className="domain-contact-info">
				<ContactForm
					initialData={ {
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
					} }
					onSubmit={ handleSubmit }
					onCancel={ handleCancel }
				/>
			</div>
		</PageLayout>
	);
}
