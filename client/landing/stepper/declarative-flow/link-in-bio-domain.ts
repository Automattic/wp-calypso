import { LINK_IN_BIO_DOMAIN_FLOW, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import LinkInBio from './link-in-bio';
import type { Flow } from './internals/types';

const linkInBioDomain: Flow = {
	...LinkInBio,
	name: LINK_IN_BIO_DOMAIN_FLOW,
	extends: LINK_IN_BIO_FLOW,
};

export default linkInBioDomain;
