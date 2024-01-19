import { OnboardActions, SiteActions } from '@automattic/data-stores';
import { SITE_STORE } from '@automattic/launchpad/src/launchpad';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTaskClickTracksEvent } from '../../tracking';
import { type TaskAction } from '../../types';

const getSetupLinkInBioTask: TaskAction = ( task, flow, context ) => {
	const { siteInfoQueryArgs } = context;

	return {
		...task,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		calypso_path: addQueryArgs(
			`/setup/link-in-bio-post-setup/linkInBioPostSetup`,
			siteInfoQueryArgs
		),
		useCalypsoPath: true,
	};
};
const getLinkInBioLaunchedTask: TaskAction = ( task, flow, context ) => {
	const { siteSlug, site, submit } = context;
	return {
		...task,
		isLaunchTask: true,
		actionDispatch: () => {
			if ( site?.ID ) {
				const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE ) as OnboardActions;
				const { launchSite } = dispatch( SITE_STORE ) as SiteActions;

				setPendingAction( async () => {
					setProgressTitle( __( 'Launching Link in bio' ) );
					await launchSite( site.ID );

					// Waits for half a second so that the loading screen doesn't flash away too quickly
					await new Promise( ( res ) => setTimeout( res, 500 ) );
					recordTaskClickTracksEvent( task, flow, context );
					return { goToHome: true, siteSlug };
				} );

				submit?.();
			}
		},
	};
};

export const actions = {
	setup_link_in_bio: getSetupLinkInBioTask,
	link_in_bio_launched: getLinkInBioLaunchedTask,
};
