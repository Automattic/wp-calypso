import { SITE_CHECKLIST_REQUEST, SITE_CHECKLIST_TASK_UPDATE } from 'calypso/state/action-types';
import { receiveSiteChecklist } from 'calypso/state/checklist/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const noop = () => {};

export const CHECKLIST_KNOWN_TASKS = {
	DOMAIN_VERIFIED: 'domain_verified',
	EMAIL_VERIFIED: 'email_verified',
	BLOGNAME_SET: 'blogname_set',
	MOBILE_APP_INSTALLED: 'mobile_app_installed',
	WOOCOMMERCE_SETUP: 'woocommerce_setup',
	SENSEI_SETUP: 'sensei_setup',
	SITE_LAUNCHED: 'site_launched',
	FRONT_PAGE_UPDATED: 'front_page_updated',
	SITE_MENU_UPDATED: 'site_menu_updated',
	SITE_THEME_SELECTED: 'site_theme_selected',
	JETPACK_BACKUPS: 'jetpack_backups',
	JETPACK_MONITOR: 'jetpack_monitor',
	JETPACK_PLUGIN_UPDATES: 'jetpack_plugin_updates',
	JETPACK_SIGN_IN: 'jetpack_sign_in',
	JETPACK_SITE_ACCELERATOR: 'jetpack_site_accelerator',
	JETPACK_LAZY_IMAGES: 'jetpack_lazy_images',
	JETPACK_VIDEO_HOSTING: 'jetpack_video_hosting',
	JETPACK_SEARCH: 'jetpack_search',
	PROFESSIONAL_EMAIL_MAILBOX_CREATED: 'professional_email_mailbox_created',
	THEMES_BROWSED: 'themes_browsed',
	FIRST_POST_PUBLISHED: 'first_post_published',
	POST_SHARING_ENABLED: 'post_sharing_enabled',
	INSTALL_CUSTOM_PLUGIN: 'install_custom_plugin',
	SETUP_SSH: 'setup_ssh',
	CART_ITEMS_ABANDONED: 'cart_items_abandoned',
};

// Transform the response to a data / schema calypso understands, eg filter out unknown tasks
const fromApi = ( payload ) => {
	// The checklist API requests use the http_envelope query param, however on
	// desktop the envelope is not being unpacked for some reason. This conversion
	// ensures the payload has been unpacked.
	const data = payload?.body ?? payload;

	if ( ! data ) {
		throw new TypeError( `Missing 'body' property on API response` );
	}
	// Legacy object-based data format for Jetpack tasks, let's convert it to the new array-based format and ultimately remove it.
	if ( ! Array.isArray( data.tasks ) ) {
		data.tasks = Object.keys( data.tasks ).map( ( taskId ) => {
			const { completed, ...rest } = data.tasks[ taskId ];
			return {
				id: taskId,
				isCompleted: completed,
				...rest,
			};
		} );
	}

	return {
		designType: data.designType,
		phase2: data.phase2,
		segment: data.segment,
		tasks: data.tasks.filter( ( task ) =>
			Object.values( CHECKLIST_KNOWN_TASKS ).includes( task.id )
		),
	};
};

export const fetchChecklist = ( action ) =>
	http(
		{
			path: `/sites/${ action.siteId }/checklist`,
			method: 'GET',
			apiVersion: '1.2',
			query: {
				http_envelope: 1,
				with_domain_verification: action.isSiteEligibleForFSE ? 1 : 0,
			},
		},
		action
	);

export const receiveChecklistSuccess = ( action, receivedChecklist ) => {
	return receiveSiteChecklist( action.siteId, receivedChecklist );
};

const dispatchChecklistRequest = dispatchRequest( {
	fetch: fetchChecklist,
	onSuccess: receiveChecklistSuccess,
	onError: noop,
	fromApi,
} );

export const updateChecklistTask = ( action ) =>
	http(
		{
			path: `/sites/${ action.siteId }/checklist`,
			method: 'POST',
			apiVersion: '1.1',
			query: {
				http_envelope: 1,
			},
			body: { taskId: action.taskId },
		},
		action
	);

const dispatchChecklistTaskUpdate = dispatchRequest( {
	fetch: updateChecklistTask,
	onSuccess: receiveChecklistSuccess,
	onError: noop,
	fromApi,
} );

registerHandlers( 'state/data-layer/wpcom/checklist/index.js', {
	[ SITE_CHECKLIST_REQUEST ]: [ dispatchChecklistRequest ],
	[ SITE_CHECKLIST_TASK_UPDATE ]: [ dispatchChecklistTaskUpdate ],
} );
