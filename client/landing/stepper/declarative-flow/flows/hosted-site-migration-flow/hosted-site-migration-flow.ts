import { HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { type Flow } from '../../internals/types';
import siteMigration from '../site-migration-flow/site-migration-flow';

const hostedSiteMigrationFlow: Flow = {
	...siteMigration,
	variantSlug: HOSTED_SITE_MIGRATION_FLOW,
	isSignupFlow: true,
};

export default hostedSiteMigrationFlow;
