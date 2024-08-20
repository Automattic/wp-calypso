import config from '@automattic/calypso-config';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { isMobile } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest from 'wpcom-proxy-request';
import type { LaunchpadTaskActionsProps, Task } from './types';

const TASKS_TO_COMPLETE_ON_CLICK = [
	'add_about_page',
	'manage_paid_newsletter_plan',
	'earn_money',
	'manage_subscribers',
	'connect_social_media',
	'drive_traffic',
	'site_monitoring_page',
	'front_page_updated',
	'post_sharing_enabled',
	'mobile_app_installed',
];

export const setUpActionsForTasks = ( {
	siteSlug,
	tasks,
	tracksData,
	extraActions,
	eventHandlers,
	uiContext = 'calypso',
}: LaunchpadTaskActionsProps ): Task[] => {
	const { recordTracksEvent, checklistSlug, launchpadContext } = tracksData;
	const { setShareSiteModalIsOpen, setActiveChecklist } = extraActions;
	const { onSiteLaunched, onTaskClick } = eventHandlers || {};

	// Add actions to the tasks.
	return tasks.map( ( task: Task ) => {
		let action: () => void;
		let logMissingCalypsoPath = false;
		let useCalypsoPath = true;
		const hasCalypsoPath = task.calypso_path !== undefined;

		if ( uiContext === 'calypso' && hasCalypsoPath ) {
			if ( task.id === 'drive_traffic' && ! isMobile() && hasCalypsoPath ) {
				task.calypso_path = addQueryArgs( task.calypso_path, { tour: 'marketingConnectionsTour' } );
			}

			// Enable task in 'calypso' context
			if ( task.id === 'setup_general' ) {
				task.disabled = false;
			}

			action = () => {
				if ( siteSlug && TASKS_TO_COMPLETE_ON_CLICK.includes( task.id ) ) {
					updateLaunchpadSettings( siteSlug, {
						checklist_statuses: { [ task.id ]: true },
					} );
				}
			};
		} else {
			switch ( task.id ) {
				case 'share_site':
					action = () => {
						setShareSiteModalIsOpen?.( true );
					};
					useCalypsoPath = false;
					break;

				case 'site_title':
					logMissingCalypsoPath = true;
					task.calypso_path = `/settings/general/${ siteSlug }`;
					break;

				case 'domain_claim':
				case 'domain_upsell':
				case 'domain_customize':
					logMissingCalypsoPath = true;
					task.calypso_path = `/domains/add/${ siteSlug }`;
					break;

				case 'drive_traffic':
					logMissingCalypsoPath = true;
					task.calypso_path = isMobile()
						? `/marketing/connections/${ siteSlug }`
						: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`;
					break;

				case 'add_new_page':
					logMissingCalypsoPath = true;
					task.calypso_path = `/page/${ siteSlug }`;
					break;

				case 'edit_page':
					logMissingCalypsoPath = true;
					task.calypso_path = `/pages/${ siteSlug }`;
					break;

				case 'update_about_page':
					logMissingCalypsoPath = true;
					task.calypso_path = `/page/${ siteSlug }/${ task?.extra_data?.about_page_id }`;
					break;

				case 'customize_welcome_message':
					logMissingCalypsoPath = true;
					task.calypso_path = config.isEnabled( 'settings/newsletter-settings-page' )
						? `/settings/newsletter/${ siteSlug }`
						: `/settings/reading/${ siteSlug }#newsletter-settings`;
					break;

				case 'manage_subscribers':
					logMissingCalypsoPath = true;
					task.calypso_path = `/subscribers/${ siteSlug }`;
					break;

				case 'site_launched':
				case 'blog_launched':
				case 'videopress_launched':
				case 'link_in_bio_launched':
					action = async () => {
						await wpcomRequest( {
							path: `/sites/${ siteSlug }/launch`,
							apiVersion: '1.1',
							method: 'post',
						} );
						onSiteLaunched?.();
					};
					useCalypsoPath = false;
					break;

				default:
					logMissingCalypsoPath = true;
					useCalypsoPath = false;
					break;
			}
		}

		if ( logMissingCalypsoPath ) {
			recordTracksEvent( 'calypso_launchpad_task_missing_calypso_path', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: launchpadContext,
			} );
		}

		const actionDispatch = () => {
			if ( siteSlug && setActiveChecklist && config.isEnabled( 'launchpad/navigator' ) ) {
				setActiveChecklist( siteSlug, checklistSlug );
			}
			onTaskClick?.( task );
			action?.();
		};

		// Note that we double-check for both the flag and a valid calypso_path as a safety check.
		// We intentionally avoid `hasCalypsoPath`, as it may be out of date.
		task.useCalypsoPath = useCalypsoPath && task.calypso_path !== undefined;

		return { ...task, actionDispatch };
	} );
};
