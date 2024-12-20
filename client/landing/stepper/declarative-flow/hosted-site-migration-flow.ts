import { HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { useSearchParams } from 'react-router-dom';
import { type Flow } from './internals/types';
import siteMigration from './site-migration-flow';

const hostedSiteMigrationFlow: Flow = {
	...siteMigration,
	variantSlug: HOSTED_SITE_MIGRATION_FLOW,
	isSignupFlow: true,
	useLoginParams() {
		const [ searchParams ] = useSearchParams();
		const backUrl = searchParams.get( 'back_url' );

		return {
			extraQueryParams: {
				...( backUrl ? { back_url: backUrl } : {} ),
			},
		};
	},
};

export default hostedSiteMigrationFlow;
