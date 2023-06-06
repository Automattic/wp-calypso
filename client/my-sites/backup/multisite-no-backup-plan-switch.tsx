import { WPCOM_FEATURES_BACKUPS } from '@automattic/calypso-products';
import { FunctionComponent, ReactNode, useCallback } from 'react';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import RenderSwitch from 'calypso/components/jetpack/render-switch';
import { useSelector } from 'calypso/state';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

type Props = {
	trueComponent: ReactNode;
	falseComponent: ReactNode;
	loadingComponent?: ReactNode;
};

const MultisiteNoBackupPlanSwitch: FunctionComponent< Props > = ( {
	trueComponent,
	falseComponent,
	loadingComponent,
} ) => {
	const siteId = useSelector( getSelectedSiteId );

	const isMultiSite =
		useSelector( ( state ) => siteId && isJetpackSiteMultiSite( state, siteId ) ) || false;

	const hasBackupFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
	);

	const isRequesting = useSelector( ( state ) => isRequestingSiteFeatures( state, siteId ) );
	const siteFeatures = useSelector( ( state ) => getFeaturesBySiteId( state, siteId ) );

	// We should keep loading if we don't have site features yet and we are requesting them.
	const loadingCondition = useCallback(
		() => isRequesting && siteFeatures === null,
		[ isRequesting, siteFeatures ]
	);

	// The idea is to render the `trueComponent` if the site is multisite and doesn't have the backup feature.
	const renderCondition = useCallback(
		() => isMultiSite && ! hasBackupFeature,
		[ hasBackupFeature, isMultiSite ]
	);

	const loadingDefaultPlaceholder = (
		<div className="loading">
			<div className="loading__placeholder" />
		</div>
	);

	return (
		<>
			<RenderSwitch
				loadingCondition={ loadingCondition }
				renderCondition={ renderCondition }
				queryComponent={ <QuerySiteFeatures siteIds={ [ siteId ] } /> }
				loadingComponent={ loadingComponent ?? loadingDefaultPlaceholder }
				trueComponent={ trueComponent }
				falseComponent={ falseComponent }
			/>
		</>
	);
};

export default MultisiteNoBackupPlanSwitch;
