import { GOOGLE_TRANSFER } from '@automattic/onboarding';
import domainTransfer from './domain-transfer';
import { Flow } from './internals/types';

const googleDomainTransfer: Flow = {
	...domainTransfer,
	variantSlug: GOOGLE_TRANSFER,
	useSteps() {
		return [
			{
				slug: 'intro',
				asyncComponent: () => import( './internals/steps-repository/domain-transfer-intro' ),
			},
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domain-transfer-domains' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},
};

export default googleDomainTransfer;
