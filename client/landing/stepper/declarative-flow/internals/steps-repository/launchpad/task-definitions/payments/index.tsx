import { translate } from 'i18n-calypso';
import { getSiteInfoQueryArgs } from '../../task-helper';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

const getSetupPaymentsTask: TaskAction = ( task, flow, context ) => {
	const { stripeConnectUrl, site, siteSlug } = context;

	const siteInfoQueryArgs = getSiteInfoQueryArgs( flow, site, siteSlug );

	return {
		...task,
		badge_text: task.completed ? translate( 'Connected' ) : null,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: stripeConnectUrl
			? stripeConnectUrl
			: `/earn/payments/${ siteInfoQueryArgs?.siteSlug }#launchpad`,
	};
};

export const actions = {
	set_up_payments: getSetupPaymentsTask,
};
