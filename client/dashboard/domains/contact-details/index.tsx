import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumb, { Item as BreadcrumbItem } from 'calypso/components/breadcrumb';
import EditContactInfoPageContent from 'calypso/my-sites/domains/domain-management/edit-contact-info-page/edit-contact-info-page-content';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

import './style.scss';

export default function DomainContactInfo() {
	const { domainName } = domainRoute.useParams();
	const navigate = useNavigate();

	const breadcrumbItems: BreadcrumbItem[] = [
		{
			label: __( 'Overview' ),
			href: `/v2/domains/${ domainName }`,
			onClick: () => {
				navigate( { to: '/domains/$domainName', params: { domainName } } );
			},
		},
	];

	const handleCloseInfo = () => {
		// TODO: Implement close functionality for the info box
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Contact details' ) }
					prefix={ <Breadcrumb items={ breadcrumbItems } /> }
				/>
			}
		>
			<div className="domain-contact-info">
				<div className="domain-contact-info__content">Here's the info box</div>

				<EditContactInfoPageContent
					domains={ [] }
					selectedDomainName={ domainName }
					selectedSite={ null }
				/>
			</div>
		</PageLayout>
	);
}
