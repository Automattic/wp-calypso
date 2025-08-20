import { __ } from '@wordpress/i18n';
import { domainsRoute } from '../app/router/domains';
import FullScreenOverlay from '../components/full-screen-overlay';
import PageLayout from '../components/page-layout';

export default function DomainsPurchase() {
	return (
		<FullScreenOverlay
			backLabel={ __( 'Back to domains' ) }
			fallbackCloseRoute={ domainsRoute.fullPath }
		>
			<PageLayout size="large">
				<p>TODO: Domains purchase component</p>
			</PageLayout>
		</FullScreenOverlay>
	);
}
