import { Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow, isReadymadeFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { isDomainUpsellCompleted, getSiteIdOrSlug } from '../../task-helper';
import { TaskAction } from '../../types';

export const getDomainUpSellTask: TaskAction = ( task, flow, context ): Task => {
	const { site, checklistStatuses, siteSlug } = context;
	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );

	const getDestionationUrl = () => {
		if ( isBlogOnboardingFlow( flow ) || isReadymadeFlow( flow ) ) {
			return addQueryArgs( `/setup/${ flow }/domains`, {
				...getSiteIdOrSlug( flow, site, siteSlug ),
				flowToReturnTo: flow,
				new: site?.name,
				domainAndPlanPackage: true,
			} );
		}

		return domainUpsellCompleted
			? `/domains/manage/${ siteSlug }`
			: addQueryArgs( `/setup/domain-upsell/domains`, {
					...getSiteIdOrSlug( flow, site, siteSlug ),
					flowToReturnTo: flow,
					new: site?.name,
			  } );
	};

	return {
		...task,
		completed: domainUpsellCompleted,
		calypso_path: getDestionationUrl(),
		badge_text:
			domainUpsellCompleted || isBlogOnboardingFlow( flow ) ? '' : translate( 'Upgrade plan' ),
		useCalypsoPath: true,
	};
};

export const actions = {
	domain_upsell: getDomainUpSellTask,
};
