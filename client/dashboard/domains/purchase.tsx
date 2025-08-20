import { __ } from '@wordpress/i18n';
import { domainsRoute } from '../app/router/domains';
import Overlay from '../components/overlay';
import PageLayout from '../components/page-layout';

export default function DomainsPurchase() {
	return (
		<Overlay backLabel={ __( 'Back to domains' ) } fallbackCloseRoute={ domainsRoute.fullPath }>
			<PageLayout size="large">
				<p>TODO: Domains purchase component</p>
			</PageLayout>
		</Overlay>
	);
}
