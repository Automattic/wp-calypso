import { WPCOM_FEATURES_BACKUPS } from '@automattic/calypso-products';
import { ReactNode, useCallback } from 'react';
import RenderSwitch from 'calypso/components/jetpack/render-switch';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

type Props = {
	trueComponent: ReactNode;
	falseComponent: ReactNode;
};

const MultisiteNoBackupPlanSwitch = ( { trueComponent, falseComponent }: Props ) => {
	const siteId = useSelector( getSelectedSiteId );

	const isMultiSite =
		useSelector( ( state ) => siteId && isJetpackSiteMultiSite( state, siteId ) ) || false;

	const hasBackupFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
	);

	// The idea is to render the `trueComponent` if the site is multisite and doesn't have the backup feature.
	const renderCondition = useCallback(
		() => isMultiSite && ! hasBackupFeature,
		[ hasBackupFeature, isMultiSite ]
	);

	return (
		<>
			<RenderSwitch
				renderCondition={ renderCondition }
				trueComponent={ trueComponent }
				falseComponent={ falseComponent }
			/>
		</>
	);
};

export default MultisiteNoBackupPlanSwitch;
