import { __ } from '@wordpress/i18n';
import { domainsRoute } from '../app/router/domains';
import DomainSearch from '../components/domain-search';
import FullScreenOverlay from '../components/full-screen-overlay';

export default function DomainsPurchase() {
	return (
		<FullScreenOverlay
			backLabel={ __( 'Back to domains' ) }
			fallbackCloseRoute={ domainsRoute.fullPath }
		>
			<DomainSearch />
		</FullScreenOverlay>
	);
}
