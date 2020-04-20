/**
 * External dependencies
 */
import { memoize, pick } from 'lodash';

class WpcomTaskList {
	constructor( tasks = [] ) {
		this.tasks = tasks;
	}

	getAll() {
		return this.tasks;
	}

	get( taskId ) {
		return this.tasks.find( ( task ) => task.id === taskId );
	}

	getIds() {
		return this.getAll().map( ( { id } ) => id );
	}

	isCompleted( taskId ) {
		const task = this.get( taskId );
		return task ? task.isCompleted : false;
	}

	has( taskId ) {
		return !! this.get( taskId );
	}

	remove( taskId ) {
		const found = this.get( taskId );
		if ( ! found ) {
			return null;
		}
		this.tasks = this.tasks.filter( ( task ) => task.id !== taskId );
		return found;
	}

	removeTasksWithoutUrls( taskUrls ) {
		const hasUrl = ( task ) => ! ( task.id in taskUrls ) || taskUrls[ task.id ];

		this.tasks = this.tasks.filter( hasUrl );
	}

	getFirstIncompleteTask() {
		return this.tasks.find( ( task ) => ! task.isCompleted );
	}

	getCompletionStatus() {
		const completed = this.tasks.filter( ( task ) => task.isCompleted ).length;
		const total = this.tasks.length;

		return {
			completed,
			total,
			percentage: Math.round( ! total ? 0 : ( completed / total ) * 100 ),
		};
	}
}

export const getTaskList = memoize(
	( params ) => new WpcomTaskList( params?.taskStatuses ),
	( params ) => {
		const key = pick( params, [
			'taskStatuses',
			'designType',
			'siteIsUnlaunched',
			'siteSegment',
			'siteVerticals',
		] );
		return JSON.stringify( key );
	}
);
