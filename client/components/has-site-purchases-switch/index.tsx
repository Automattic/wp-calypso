import { sitePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useCallback } from 'react';
import * as React from 'react';
import RenderSwitch from 'calypso/components/jetpack/render-switch';

type Props = {
	siteId: number;
	trueComponent: ReactNode;
	falseComponent: ReactNode;
	loadingComponent?: ReactNode;
};

const HasSitePurchasesSwitch: React.FC< Props > = ( {
	siteId,
	trueComponent,
	falseComponent,
	loadingComponent,
} ) => {
	const { data: purchases, isLoading } = useQuery( {
		...sitePurchasesQuery( siteId ),
		enabled: Boolean( siteId ),
	} );

	const loadingCondition = useCallback( () => isLoading, [ isLoading ] );
	const renderCondition = useCallback( () => Boolean( purchases?.length ), [ purchases ] );

	return (
		<RenderSwitch
			trueComponent={ trueComponent }
			falseComponent={ falseComponent }
			loadingComponent={ loadingComponent }
			loadingCondition={ loadingCondition }
			renderCondition={ renderCondition }
		/>
	);
};

export default HasSitePurchasesSwitch;
