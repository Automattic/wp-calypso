import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import ContactForm from './contact-form';

import './style.scss';

export default function DomainContactInfo() {
	const { domainName } = domainRoute.useParams();
	const navigate = useNavigate();

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
						firstName: 'John',
						lastName: 'Doe',
						organization: 'WordPress',
						email: 'john.doe@wordpress.org',
						phone: '+44 1234 567890',
						countryCode: 'BR',
						address1: '123 Main St',
						address2: 'Apt 4B',
						city: 'London',
						postalCode: 'NW1 1ED',
						optOutTransferLock: false,
					} }
					onSubmit={ handleSubmit }
					onCancel={ handleCancel }
				/>
			</div>
		</PageLayout>
	);
}
