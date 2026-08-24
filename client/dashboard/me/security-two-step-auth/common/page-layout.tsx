import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function SecurityTwoStepAuthPageLayout( {
	children,
}: {
	children: React.ReactNode;
} ) {
	return (
		<PageLayout size="small" header={ <PageHeader prefix={ <Breadcrumbs length={ 3 } /> } /> }>
			{ children }
		</PageLayout>
	);
}
