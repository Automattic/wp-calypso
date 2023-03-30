import { LINK_IN_BIO_DOMAIN_FLOW, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import { useDomainParams } from '../hooks/use-domain-params';
import { redirect } from './internals/steps-repository/import/util';
import { AssertConditionResult, AssertConditionState, Flow } from './internals/types';
import LinkInBio from './link-in-bio';

const linkInBioDomain: Flow = {
	...LinkInBio,
	variantSlug: LINK_IN_BIO_DOMAIN_FLOW,
	useAssertConditions: () => {
		const { domain } = useDomainParams();
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! domain ) {
			redirect( ` /setup/${ LINK_IN_BIO_FLOW }` );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'link-in-bio-domain requires a domain query parameter',
			};
		}
		return result;
	},
};

export default linkInBioDomain;
