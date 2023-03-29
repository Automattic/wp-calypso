import { LINK_IN_BIO_DOMAIN_FLOW } from '@automattic/onboarding';
import LinkInBio from './link-in-bio';
import type { Flow } from './internals/types';

const linkInBioDomain: Flow = {
	...LinkInBio,
	variantSlug: LINK_IN_BIO_DOMAIN_FLOW,
};

export default linkInBioDomain;
