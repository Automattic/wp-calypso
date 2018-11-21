/** @format */
/**
 * External dependencies
 */
import { get, memoize } from 'lodash';

export default class WpcomTaskList {
	constructor( taskStatuses, designType, isSiteUnlaunched ) {
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

		if ( designType === 'blog' ) {
			addTask( 'avatar_uploaded' );
		}

		addTask( 'contact_page_updated' );

		if ( designType === 'blog' ) {
			addTask( 'post_published' );
		}

		addTask( 'custom_domain_registered' );
		addTask( 'mobile_app_installed' );

		if ( get( taskStatuses, 'email_verified.completed' ) && isSiteUnlaunched ) {
			addTask( 'site_launched' );
		}
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

	getCompletionStatus() {
		const completed = this.tasks.filter( task => task.isCompleted ).length;
		const total = this.tasks.length;

		return {
			completed,
			total,
			percentage: Math.round( ! total ? 0 : ( completed / total ) * 100 ),
		};
	}
}

export const getTaskList = memoize(
	( taskStatuses, designType, isSiteUnlaunched ) =>
		new WpcomTaskList( taskStatuses, designType, isSiteUnlaunched )
);
