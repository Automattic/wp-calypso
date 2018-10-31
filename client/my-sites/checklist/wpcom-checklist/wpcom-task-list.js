/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

export default class WpcomTaskList {
	constructor( taskStatuses, conditionalParams = {} ) {
		this.tasks = [];

		const isCompleted = taskId => get( taskStatuses, [ taskId, 'completed' ], false );

		const addTask = ( taskId, completedStatus = undefined ) =>
			this.tasks.push( {
				id: taskId,
				isCompleted: completedStatus !== undefined ? completedStatus : isCompleted( taskId ),
			} );

		addTask( 'email_verified' );
		addTask( 'site_created', true );
		addTask( 'address_picked', true );
		addTask( 'blogname_set' );
		addTask( 'site_icon_set' );
		addTask( 'blogdescription_set' );

		if ( conditionalParams.designType === 'blog' ) {
			addTask( 'avatar_uploaded' );
		}

		addTask( 'contact_page_updated' );

		if ( conditionalParams.designType === 'blog' ) {
			addTask( 'post_published' );
		}

		addTask( 'custom_domain_registered' );
		addTask( 'mobile_app_installed' );
	}

	getAll() {
		return this.tasks;
	}

	get( taskId ) {
		return this.tasks.find( task => task.id === taskId );
	}

	has( taskId ) {
		return !! this.get( taskId );
	}

	getFirstIncompleteTask() {
		return this.tasks.find( task => ! task.isCompleted );
	}
}
