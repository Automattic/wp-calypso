import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { domainWhoisQuery } from '../../app/queries/domain-whois';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { findRegistrantWhois } from '../../utils/domain';
import ContactForm from './contact-form';
import type { DomainContactDetails } from '../../data/types';

export default function DomainContactInfo() {
	const { domainName } = domainRoute.useParams();
	const navigate = useNavigate();
	const { data: whoisData } = useQuery( domainWhoisQuery( domainName ) );
	const registrantWhoisData = findRegistrantWhois( whoisData );

	const handleSubmit = () => {
		navigate( { to: '/domains/$domainName', params: { domainName } } );
	};

	const handleCancel = () => {
		navigate( { to: '/domains/$domainName', params: { domainName } } );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Contact details' ) } /> }>
			<ContactForm
				domainName={ domainName }
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
				onSubmit={ handleSubmit }
				onCancel={ handleCancel }
				errors={ {} }
			/>
		</PageLayout>
	);
}
