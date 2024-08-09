import { isEnabled } from '@automattic/calypso-config';
import { HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { type Flow } from './internals/types';
import migration from './migration';
import siteMigration from './site-migration-flow';

const baseFlow = isEnabled( 'migration-flow/revamp' ) ? migration : siteMigration;

const hostedSiteMigrationFlow: Flow = {
	...baseFlow,
	variantSlug: HOSTED_SITE_MIGRATION_FLOW,
	isSignupFlow: true,
};

export default hostedSiteMigrationFlow;
