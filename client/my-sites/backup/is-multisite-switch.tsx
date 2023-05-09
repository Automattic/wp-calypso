import { WPCOM_FEATURES_BACKUPS } from '@automattic/calypso-products';
import { FunctionComponent, ReactNode, useCallback } from 'react';
import { useSelector } from 'react-redux';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import RenderSwitch from 'calypso/components/jetpack/render-switch';
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

const IsMultiSiteSwitch: FunctionComponent< Props > = ( {
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
	const loadingCondition = useCallback(
		() => isRequesting && siteFeatures === null,
		[ isRequesting, siteFeatures ]
	);

	const renderCondition = useCallback(
		() => isMultiSite && ! hasBackupFeature,
		[ hasBackupFeature, isMultiSite ]
	);

	return (
		<>
			<RenderSwitch
				loadingCondition={ loadingCondition }
				renderCondition={ renderCondition }
				queryComponent={ <QuerySiteFeatures siteIds={ [ siteId ] } /> }
				loadingComponent={ loadingComponent }
				trueComponent={ trueComponent }
				falseComponent={ falseComponent }
			/>
		</>
	);
};

export default IsMultiSiteSwitch;
