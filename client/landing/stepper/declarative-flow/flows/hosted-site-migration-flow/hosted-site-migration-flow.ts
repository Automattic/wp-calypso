import { HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { useSearchParams } from 'react-router-dom';
import { type Flow } from '../../internals/types';
import siteMigration from '../site-migration-flow/site-migration-flow';

/**
 * @deprecated Please use SITE_MIGRATION_FLOW instead
 */
const hostedSiteMigrationFlow: Flow = {
	...siteMigration,
	variantSlug: HOSTED_SITE_MIGRATION_FLOW,
	isSignupFlow: true,
	useLoginParams() {
		const [ searchParams ] = useSearchParams();
		const backTo = searchParams.get( 'back_to' );

		return {
			extraQueryParams: {
				...( backTo ? { back_to: backTo } : {} ),
			},
		};
	},
};

export default hostedSiteMigrationFlow;
