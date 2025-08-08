import { Card, CardBody, __experimentalText as Text } from '@wordpress/components';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function DomainDNSSEC() {
	const { domainName } = domainRoute.useParams();

	return (
		<PageLayout size="small" header={ <PageHeader title="DNS Records" /> }>
			<Card>
				<CardBody>
					<Text>DNS Placeholder { domainName }</Text>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
