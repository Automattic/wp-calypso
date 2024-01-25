import { updateLaunchpadSettings } from '@automattic/data-stores/src/queries/use-launchpad';
import { isNewsletterFlow } from '@automattic/onboarding';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../types';

const completeMigrateContentTask = async ( siteSlug: string | null ) => {
	if ( siteSlug ) {
		await updateLaunchpadSettings( siteSlug, {
			checklist_statuses: { migrate_content: true },
		} );
	}
};

const getMigrateContentTask: TaskAction = ( task, flow, context ) => {
	const { isEmailVerified, siteSlug } = context;
	const mustVerifyEmailBeforePosting = isNewsletterFlow( flow ) && ! isEmailVerified;
	return {
		...task,
		disabled: mustVerifyEmailBeforePosting || false,
		actionDispatch: () => {
			recordTaskClickTracksEvent( task, flow, context );
			completeMigrateContentTask( siteSlug );
		},
		useCalypsoPath: true,
	};
};

export const actions = {
	migrate_content: getMigrateContentTask,
};
