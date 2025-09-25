import { Task } from '@automattic/launchpad';
import { isStartWritingFlow } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { isDomainUpsellCompleted } from '../../task-helper';
import { TaskAction } from '../../types';

export const getDomainUpSellTask: TaskAction = ( task, flow, context ): Task => {
	const { site, checklistStatuses, siteSlug } = context;
	const domainUpsellCompleted = isDomainUpsellCompleted( site, checklistStatuses );

	const getDestionationUrl = () => {
		const purchaseDomainUrl = addQueryArgs( '/setup/domain-upsell', {
			siteSlug,
			back_to: `/setup/${ flow }/launchpad?siteSlug=${ siteSlug }`,
			new: site?.name,
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
