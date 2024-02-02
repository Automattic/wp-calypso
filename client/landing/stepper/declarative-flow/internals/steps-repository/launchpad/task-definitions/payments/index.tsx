import { translate } from 'i18n-calypso';
import { type TaskAction } from '../../types';

export const getSetupPaymentsTask: TaskAction = ( task, flow, context ) => {
	const { siteInfoQueryArgs, stripeConnectUrl } = context;

	return {
		...task,
		badge_text: task.completed ? translate( 'Connected' ) : null,
		calypso_path: stripeConnectUrl
			? stripeConnectUrl
			: `/earn/payments/${ siteInfoQueryArgs?.siteSlug }#launchpad`,
		useCalypsoPath: true,
	};
};

export const actions = {
	set_up_payments: getSetupPaymentsTask,
};
