import { Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow, isSiteAssemblerFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { getSiteInfoQueryArgs, isDomainUpsellCompleted } from '../../task-helper';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

const getDomainUpSellTask: TaskAction = ( task, flow, context ): Task => {
	const { site, siteSlug, checklistStatuses } = context;

	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );
	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );

	const getDestionationUrl = () => {
		if ( isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow ) ) {
			return addQueryArgs( `/setup/${ flow }/domains`, {
				...siteInfoQueryArgs,
				flowToReturnTo: flow,
				new: site?.name,
				domainAndPlanPackage: true,
			} );
		}

		return domainUpsellCompleted
			? `/domains/manage/${ siteInfoQueryArgs?.siteSlug }`
			: addQueryArgs( `/setup/domain-upsell/domains`, {
					...siteInfoQueryArgs,
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
