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
						firstName: 'Value',
						lastName: 'Value',
						organization: '',
						email: 'email@email.com',
						phone: '+44 1234 567890',
						country: 'GB',
						addressLine1: '',
						addressLine2: '',
						city: 'London',
						postCode: 'NW1 1ED',
					} }
					onSubmit={ handleSubmit }
					onCancel={ handleCancel }
				/>
			</div>
		</PageLayout>
	);
}
