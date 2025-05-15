import { taxDetailsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function TaxDetails() {
	return (
		<PageLayout size="small">
			<PageHeader title={ taxDetailsRoute.options.staticData.label() } />
			<div>Tax details content will go here</div>
		</PageLayout>
	);
}
