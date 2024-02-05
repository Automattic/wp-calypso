import { Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow, isSiteAssemblerFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { getSiteIdOrSlug, isDomainUpsellCompleted } from '../../task-helper';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

export const getDomainUpSellTask: TaskAction = ( task, flow, context ): Task => {
	const { site, checklistStatuses, siteSlug } = context;
	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );

	const getDestionationUrl = () => {
		if ( isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow ) ) {
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
		actionDispatch: () =>
			recordTaskClickTracksEvent( { ...task, completed: domainUpsellCompleted }, flow, context ),
		calypso_path: getDestionationUrl(),
		badge_text:
			domainUpsellCompleted || isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow )
				? ''
				: translate( 'Upgrade plan' ),
		useCalypsoPath: true,
	};
};

export const actions = {
	domain_upsell: getDomainUpSellTask,
};
