import { HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { type FlowV2 } from '../../internals/types';
import siteMigration from '../site-migration-flow/site-migration-flow';

const hostedSiteMigrationFlow: FlowV2< any > = {
	...siteMigration,
	variantSlug: HOSTED_SITE_MIGRATION_FLOW,
	isSignupFlow: true,
};

export default hostedSiteMigrationFlow;
