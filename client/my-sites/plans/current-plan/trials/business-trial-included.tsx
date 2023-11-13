import { localize, translate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import FeatureIncludedCard from '../feature-included-card';
import useBusinessTrialIncludedFeatures from './use-business-trial-included-features';

interface Props {
	translate: typeof translate;
	displayAll: boolean;
	displayOnlyActionableItems?: boolean;
}
const BusinessTrialIncluded: FunctionComponent< Props > = ( props ) => {
	const { displayAll = true, displayOnlyActionableItems = false } = props;

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const allIncludedFeatures = useBusinessTrialIncludedFeatures( siteSlug, siteAdminUrl || '' );

	let whatsIncluded = displayAll
		? allIncludedFeatures
		: // Show only first 4 items
		  allIncludedFeatures.slice( 0, 4 );

	if ( displayOnlyActionableItems ) {
		whatsIncluded = whatsIncluded.filter( ( item ) => item.buttonClick );
	}

	return (
		<>
			{ whatsIncluded.map( ( feature ) => (
				<FeatureIncludedCard
					key={ feature.title }
					illustration={ feature.illustration }
					title={ feature.title }
					text={ feature.text }
					showButton={ feature.showButton }
					buttonText={ feature.buttonText }
					buttonClick={ feature.buttonClick }
				></FeatureIncludedCard>
			) ) }
		</>
	);
};

export default localize( BusinessTrialIncluded );
