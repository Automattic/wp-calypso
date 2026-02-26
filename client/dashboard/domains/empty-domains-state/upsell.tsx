import { useAnalytics } from '../../app/analytics';
import OfferCard from '../../components/offer-card';

export function EmptyDomainsStateUpsell() {
	const { recordTracksEvent } = useAnalytics();

	const handleOfferClick = () => {
		recordTracksEvent( 'calypso_domains_dashboard_empty_state_action_click', {
			action: 'offer',
		} );
	};

	return <OfferCard onClick={ handleOfferClick } />;
}
