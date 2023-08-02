import { FunctionComponent, ReactNode, useCallback } from 'react';
import QueryRewindPolicies from 'calypso/components/data/query-rewind-policies';
import QueryRewindSize from 'calypso/components/data/query-rewind-size';
import RenderSwitch from 'calypso/components/jetpack/render-switch';
import { useSelector } from 'calypso/state';
import getRewindBytesAvailable from 'calypso/state/rewind/selectors/get-rewind-bytes-available';
import getRewindPoliciesRequestStatus from 'calypso/state/rewind/selectors/get-rewind-policies-request-status';
import getRewindSizeRequestStatus from 'calypso/state/rewind/selectors/get-rewind-size-request-status';
import isRequestingRewindPolicies from 'calypso/state/rewind/selectors/is-requesting-rewind-policies';
import isRequestingRewindSize from 'calypso/state/rewind/selectors/is-requesting-rewind-size';

type Props = {
	siteId: number;
	trueComponent: ReactNode;
	falseComponent: ReactNode;
	loadingComponent?: ReactNode;
};

const HasRetentionCapabilitiesSwitch: FunctionComponent< Props > = ( {
	siteId,
	trueComponent,
	falseComponent,
	loadingComponent,
} ) => {
	const fetchingSize = useSelector( ( state ) => isRequestingRewindSize( state, siteId ) );
	const fetchingPolicies = useSelector( ( state ) => isRequestingRewindPolicies( state, siteId ) );

	const sizeStatus = useSelector( ( state ) => getRewindSizeRequestStatus( state, siteId ) );
	const policiesStatus = useSelector( ( state ) =>
		getRewindPoliciesRequestStatus( state, siteId )
	);

	const isFetching = fetchingSize || fetchingPolicies;
	const hasLoaded = sizeStatus === 'success' && policiesStatus === 'success';

	const storageLimitBytes = useSelector( ( state ) =>
		getRewindBytesAvailable( state, siteId )
	) as number;

	const loadingCondition = useCallback(
		() => ! hasLoaded || isFetching,
		[ hasLoaded, isFetching ]
	);

	const renderCondition = useCallback(
		() => hasLoaded && storageLimitBytes > 0,
		[ hasLoaded, storageLimitBytes ]
	);

	return (
		<RenderSwitch
			queryComponent={
				<>
					<QueryRewindPolicies siteId={ siteId } />
					<QueryRewindSize siteId={ siteId } />
				</>
			}
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
			loadingComponent={ loadingComponent }
			loadingCondition={ loadingCondition }
			renderCondition={ renderCondition }
		/>
	);
};

export default HasRetentionCapabilitiesSwitch;
