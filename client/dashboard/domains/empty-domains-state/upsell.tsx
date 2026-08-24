import { useAnalytics } from '../../app/analytics';
import OfferCard from '../../components/offer-card';

export function EmptyDomainsStateUpsell() {
	const { recordTracksEvent } = useAnalytics();

	const handleOfferClick = () => {
		recordTracksEvent( 'calypso_dashboard_domains_empty_state_action_click', {
			action: 'offer',
		} );
	};

	return <OfferCard onClick={ handleOfferClick } />;
}
