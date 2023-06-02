import { ReactElement, useCallback } from 'react';
import * as React from 'react';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import RenderSwitch from 'calypso/components/jetpack/render-switch';
import { useSelector } from 'calypso/state';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

const productStateImpliesVaultPress = ( productState?: { state?: string; reason?: string } ) => {
	if ( ! productState ) {
		return undefined;
	}

	// VaultPress sites always return a Rewind/Scan status of 'unavailable'
	if ( productState.state !== 'unavailable' ) {
		return false;
	}

	// These "reasons" for the unavailable state imply that
	// this site uses VaultPress instead of Rewind.
	const vaultPressReasons = [ 'vp_active_on_site', 'host_not_supported' ];

	return productState.reason && vaultPressReasons.includes( productState.reason );
};

const isInitialized = ( productState: { state?: string } | null | undefined ) =>
	productState && productState.state !== 'uninitialized';

const HasVaultPressSwitch: React.FC< Props > = ( {
	loadingComponent,
	trueComponent,
	falseComponent,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) );
	const scanState = useSelector( ( state ) => getSiteScanState( state, siteId ?? 0 ) );

	const hasVaultPress = useCallback(
		() => [ rewindState, scanState ].some( productStateImpliesVaultPress ),
		[ rewindState, scanState ]
	);

	const isLoading = useCallback( () => {
		if ( hasVaultPress() ) {
			return false;
		}

		return [ rewindState, scanState ].some( ( state ) => ! isInitialized( state ) );
	}, [ hasVaultPress, rewindState, scanState ] );

	return (
		<RenderSwitch
			loadingCondition={ isLoading }
			renderCondition={ hasVaultPress }
			queryComponent={
				<>
					<QueryRewindState siteId={ siteId } />
					<QueryJetpackScan siteId={ siteId ?? 0 } />
				</>
			}
			loadingComponent={ loadingComponent }
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
		/>
	);
};

type Props = {
	loadingComponent?: ReactElement;
	trueComponent?: ReactElement;
	falseComponent?: ReactElement;
};

export default HasVaultPressSwitch;
