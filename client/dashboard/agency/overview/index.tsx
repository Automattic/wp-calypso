import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function AgencyOverview() {
	return (
		<PageLayout
			header={ <PageHeader description="This is a sample overview page." /> }
		></PageLayout>
	);
}
