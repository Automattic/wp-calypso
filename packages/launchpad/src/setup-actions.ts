import { isMobile } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import type { Task } from './types';

export const setUpActions = ( tasks: Task[], siteSlug: string | null ): Task[] => {
	// Add actions to known tasks
	return tasks.map( ( task: Task ) => {
		let actionDispatch;

		switch ( task.id ) {
			case 'site_title':
				actionDispatch = () => {
					window.location.assign( `/settings/general/${ siteSlug }` );
				};
				break;

			case 'design_edited':
				actionDispatch = () => {
					window.location.assign(
						addQueryArgs( `/site-editor/${ siteSlug }`, {
							canvas: 'edit',
						} )
					);
				};
				break;

			case 'domain_claim':
			case 'domain_upsell':
			case 'domain_customize':
				actionDispatch = () => {
					window.location.assign( `/domains/add/${ siteSlug }` );
				};
				break;
			case 'drive_traffic':
				actionDispatch = () => {
					const url = isMobile()
						? `/marketing/connections/${ siteSlug }`
						: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`;
					window.location.assign( url );
				};
				break;
			case 'add_new_page':
				actionDispatch = () => {
					window.location.assign( `/page/${ siteSlug }` );
				};
				break;
			case 'edit_page':
				actionDispatch = () => {
					window.location.assign( `/pages/${ siteSlug }` );
				};
				break;
		}

		return { ...task, actionDispatch };
	} );
};
