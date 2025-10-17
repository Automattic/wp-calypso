import { domainWhoisQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { findRegistrantWhois } from '../../utils/domain';
import ContactForm from './contact-form';
import type { DomainContactDetails } from '@automattic/api-core';

export default function DomainContactInfo() {
	const { domainName } = domainRoute.useParams();
	const { data: whoisData } = useQuery( domainWhoisQuery( domainName ) );
	const registrantWhoisData = findRegistrantWhois( whoisData );

	return (
		<PageLayout size="small" header={ <PageHeader prefix={ <Breadcrumbs length={ 2 } /> } /> }>
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
			/>
		</PageLayout>
	);
}
