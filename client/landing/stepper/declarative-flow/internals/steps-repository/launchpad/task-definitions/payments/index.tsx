import { translate } from 'i18n-calypso';
import { recordTaskClickTracksEvent } from '../../tracking';
import { type TaskAction } from '../../types';

export const getSetupPaymentsTask: TaskAction = ( task, flow, context ) => {
	const { siteInfoQueryArgs, stripeConnectUrl } = context;

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
