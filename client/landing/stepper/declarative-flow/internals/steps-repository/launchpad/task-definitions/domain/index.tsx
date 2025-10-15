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

		const backUrl = `/setup/${ flow }/launchpad?siteSlug=${ siteSlug }`;

		const purchaseDomainUrl = getDomainAndPlanUpsellUrl( {
			siteSlug,
			backUrl,
			suggestion: site?.name,
		} );

		return domainUpsellCompleted ? `/domains/manage/${ siteSlug }` : purchaseDomainUrl;
	};

	return {
		...task,
		completed: domainUpsellCompleted,
		calypso_path: getDestionationUrl(),
		badge_text:
			domainUpsellCompleted || isStartWritingFlow( flow ) ? '' : translate( 'Upgrade plan' ),
		useCalypsoPath: true,
	};
};

export const actions = {
	domain_upsell: getDomainUpSellTask,
};
