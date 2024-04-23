import { type Flow } from './internals/types';
import siteMigration from './site-migration-flow';

const siteMigrationSignup: Flow = {
	...siteMigration,
	isSignupFlow: true,
	variantSlug: 'site-migration-signup',
};

export default siteMigrationSignup;
