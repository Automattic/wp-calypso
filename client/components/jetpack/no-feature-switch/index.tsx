import { FunctionComponent, ReactNode, useCallback } from 'react';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import RenderSwitch from 'calypso/components/jetpack/render-switch';
import { useSelector } from 'calypso/state';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

type Props = {
	feature: string;
	trueComponent: ReactNode;
	falseComponent: ReactNode;
	loadingComponent?: ReactNode;
};

/**
 * Renders trueComponent when the site does NOT have the specified feature,
 * falseComponent when it does. Handles loading state while features are being fetched.
 */
const NoFeatureSwitch: FunctionComponent< Props > = ( {
	feature,
	trueComponent,
	falseComponent,
	loadingComponent,
} ) => {
	const siteId = useSelector( getSelectedSiteId );

	const hasFeature = useSelector( ( state ) => siteHasFeature( state, siteId, feature ) );

	const isRequesting = useSelector( ( state ) => isRequestingSiteFeatures( state, siteId ) );
	const siteFeatures = useSelector( ( state ) => getFeaturesBySiteId( state, siteId ) );

	// We should keep loading if we don't have site features yet and we are requesting them.
	const loadingCondition = useCallback(
		() => isRequesting && siteFeatures === null,
		[ isRequesting, siteFeatures ]
	);

	// Render the `trueComponent` (upsell) if the site doesn't have the feature.
	const renderCondition = useCallback( () => ! hasFeature, [ hasFeature ] );

	const loadingDefaultPlaceholder = (
		<div className="loading">
			<div className="loading__placeholder" />
		</div>
	);

	return (
		<RenderSwitch
			loadingCondition={ loadingCondition }
			renderCondition={ renderCondition }
			queryComponent={ <QuerySiteFeatures siteIds={ [ siteId ] } /> }
			loadingComponent={ loadingComponent ?? loadingDefaultPlaceholder }
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
		/>
	);
};

export default NoFeatureSwitch;
