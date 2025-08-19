import { domainsRoute } from '../app/router/domains';
import Overlay from '../components/overlay';
import PageLayout from '../components/page-layout';

export default function DomainsPurchase() {
	return (
		<Overlay fallbackCloseRoute={ domainsRoute.fullPath }>
			<PageLayout size="large">
				<p>TODO: Domains purchase component</p>
			</PageLayout>
		</Overlay>
	);
}
