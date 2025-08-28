import { recordTracksEvent } from '@automattic/calypso-analytics';
import { type DomainSuggestion } from '@automattic/data';
import { DomainSearchSkipSuggestion } from '@automattic/domain-search';
import { useEffect, useCallback } from '@wordpress/element';
import { Site } from 'calypso/dashboard/data/site';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useDomainSearch } from '../__legacy/domain-search';

type BaseProps = {
	flowName?: string;
	query?: string;
	onSkip: () => void;
	isLoadingSubdomainSuggestions?: boolean;
};

type WithSelectedSite = BaseProps & {
	selectedSite: Site;
	subdomainSuggestion?: DomainSuggestion;
};

type WithSubdomainSuggestion = BaseProps & {
	selectedSite?: Site;
	subdomainSuggestion: DomainSuggestion;
};

type Props = WithSelectedSite | WithSubdomainSuggestion;

const DomainSkipSuggestion = ( {
	selectedSite,
	subdomainSuggestion,
	isLoadingSubdomainSuggestions,
	flowName,
	query,
	onSkip,
}: Props ) => {
	const currentUser = useSelector( getCurrentUser );
	const { cart } = useDomainSearch();

	const existingSiteUrl = selectedSite?.slug;
	const freeSuggestion = subdomainSuggestion?.domain_name;

	useEffect( () => {
		if ( isLoadingSubdomainSuggestions ) {
			return;
		}

		if ( ! existingSiteUrl && ! freeSuggestion ) {
			recordTracksEvent( 'calypso_domain_search_skip_no_site_and_suggestion', {
				query,
				user_id: currentUser?.ID,
				flow_name: flowName,
			} );
		}
	}, [
		existingSiteUrl,
		freeSuggestion,
		query,
		currentUser?.ID,
		flowName,
		isLoadingSubdomainSuggestions,
	] );

	const onSkipClick = useCallback( () => {
		if ( existingSiteUrl ) {
			// Skip it when we have a selected site
			onSkip();
		} else if ( freeSuggestion ) {
			// Add the subdomain suggestion to the cart and move to the next step
			cart.onAddItem( freeSuggestion );
		}
	}, [ existingSiteUrl, cart, freeSuggestion, onSkip ] );

	return (
		<DomainSearchSkipSuggestion
			freeSuggestion={ freeSuggestion }
			existingSiteUrl={ existingSiteUrl }
			onSkip={ onSkipClick }
			disabled={ cart.isBusy }
			isBusy={ cart.isBusy }
		/>
	);
};

export default DomainSkipSuggestion;
