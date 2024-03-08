import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localize, translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import FeatureIncludedCard from '../feature-included-card';
import useBusinessTrialIncludedFeatures from './use-business-trial-included-features';
import type { FunctionComponent } from 'react';

interface Props {
	translate: typeof translate;
	displayAll: boolean;
	displayOnlyActionableItems?: boolean;
	tracksContext: 'upgrade_confirmation' | 'current_plan';
}
const BusinessTrialIncluded: FunctionComponent< Props > = ( props ) => {
	const { displayAll = true, displayOnlyActionableItems = false, tracksContext } = props;

	const siteId = useSelector( getSelectedSiteId ) || -1;
	const siteSlug = useSelector( getSelectedSiteSlug ) || '';
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const allIncludedFeatures = useBusinessTrialIncludedFeatures( siteSlug, siteAdminUrl || '' );

	let whatsIncluded = displayAll
		? allIncludedFeatures
		: // Show only first 4 items
		  allIncludedFeatures.slice( 0, 4 );

	if ( displayOnlyActionableItems ) {
		whatsIncluded = whatsIncluded.filter( ( item ) => item.buttonClick );
	}

	const handleFeatureClick = ( feature: ( typeof whatsIncluded )[ 0 ] ) => {
		if ( ! feature.buttonClick ) {
			return;
		}

		recordTracksEvent( 'calypso_business_trial_included_features_click', {
			feature_id: feature.id,
			context: tracksContext,
		} );
		feature.buttonClick();
	};

	return whatsIncluded.map( ( feature ) => (
		<FeatureIncludedCard
			key={ feature.id }
			illustration={ feature.illustration }
			title={ feature.title }
			text={ feature.text }
			showButton={ feature.showButton }
			buttonText={ feature.buttonText }
			buttonClick={ () => handleFeatureClick( feature ) }
		></FeatureIncludedCard>
	) );
};

export default localize( BusinessTrialIncluded );
