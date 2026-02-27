import { Task } from '@automattic/launchpad';
import { isStartWritingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { getDomainAndPlanUpsellUrl } from 'calypso/lib/domains';
import { getSiteIdOrSlug, isDomainUpsellCompleted } from '../../task-helper';
import { TaskAction } from '../../types';

export const getDomainUpSellTask: TaskAction = ( task, flow, context ): Task => {
	const { site, checklistStatuses, siteSlug } = context;
	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );

	const hasPaidNonMonthlyPlan =
		site?.plan && ! site.plan.is_free && site.plan.billing_period !== 'Monthly';

	const getDestionationUrl = () => {
		if ( ! siteSlug ) {
			return '';
		}

		if ( isStartWritingFlow( flow ) ) {
			return addQueryArgs( `/setup/${ flow }/domains`, {
				...getSiteIdOrSlug( flow, site, siteSlug ),
				flowToReturnTo: flow,
				new: site?.name,
			} );
		}

		// Users with a paid non-monthly plan already have a qualifying plan
		// and don't need the combined domain-and-plan upsell flow.
		if ( hasPaidNonMonthlyPlan ) {
			return checklistStatuses?.domain_upsell_deferred === true
				? `/domains/manage/${ siteSlug }`
				: `/domains/add/${ siteSlug }`;
		}

		// Monthly plans don't include a free domain, so monthly plan users still
		// need the domain-and-plan flow to upgrade their plan.
		const isMonthlyPlan = site?.plan?.billing_period === 'Monthly' && ! site?.plan?.is_free;
		const effectiveDomainUpsellCompleted = isMonthlyPlan
			? checklistStatuses?.domain_upsell_deferred === true
			: domainUpsellCompleted;

		const backUrl = `/setup/${ flow }/launchpad?siteSlug=${ siteSlug }`;

		const purchaseDomainUrl = getDomainAndPlanUpsellUrl( {
			siteSlug,
			backUrl,
			suggestion: site?.name,
		} );

		return effectiveDomainUpsellCompleted ? `/domains/manage/${ siteSlug }` : purchaseDomainUrl;
	};

	return {
		...task,
		completed: domainUpsellCompleted,
		calypso_path: getDestionationUrl(),
		badge_text:
			domainUpsellCompleted || isStartWritingFlow( flow ) || hasPaidNonMonthlyPlan
				? ''
				: translate( 'Upgrade plan' ),
		useCalypsoPath: true,
	};
};

export const actions = {
	domain_upsell: getDomainUpSellTask,
};
