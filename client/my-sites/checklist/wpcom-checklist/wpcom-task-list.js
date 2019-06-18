/** @format */
/**
 * External dependencies
 */
import { get, isBoolean, memoize, omit, pick, size } from 'lodash';
import debugModule from 'debug';
import config from 'config';

/**
 * Internal dependencies
 */
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { getVerticalTaskList } from './vertical-task-list';

const debug = debugModule( 'calypso:wpcom-task-list' );

function getTasks( {
	designType,
	isSiteUnlaunched,
	phase2,
	siteSegment,
	siteVerticals,
	taskStatuses,
} ) {
	// The getTasks function can be removed when we make a full switch to "phase 2"
	if ( phase2 && size( taskStatuses ) ) {
		// Use the server response, Luke
		return taskStatuses;
	}

	const tasks = [];
	const segmentSlug = getSiteTypePropertyValue( 'id', siteSegment, 'slug' );

	const getTask = taskId =>
		taskStatuses ? taskStatuses.filter( task => task.id === taskId )[ 0 ] : undefined;
	const hasTask = taskId => getTask( taskId ) !== undefined;
	const isCompleted = taskId => get( getTask( taskId ), 'isCompleted', false );
	const addTask = ( taskId, completed ) => {
		const task = Object.assign( omit( getTask( taskId ), [ 'isCompleted' ] ), {
			id: taskId,
			isCompleted: isBoolean( completed ) ? completed : isCompleted( taskId ),
		} );

		tasks.push( task );
	};

	addTask( 'email_verified' );
	addTask( 'site_created', true );

	if ( 'business' === segmentSlug ) {
		addTask( 'about_text_updated' );
		addTask( 'homepage_photo_updated' );
		addTask( 'business_hours_added' );

		getVerticalTaskList( siteVerticals ).forEach( addTask );
	} else {
		addTask( 'blogname_set' );
		addTask( 'blogdescription_set' );

		if ( designType === 'blog' ) {
			addTask( 'avatar_uploaded' );
		}

		addTask( 'contact_page_updated' );

		if ( designType === 'blog' ) {
			addTask( 'post_published' );
		}

		addTask( 'site_icon_set' );
	}

	addTask( 'custom_domain_registered' );
	addTask( 'mobile_app_installed' );

	if ( get( taskStatuses, 'email_verified.completed' ) && isSiteUnlaunched ) {
		addTask( 'site_launched' );
	}

	if ( config.isEnabled( 'onboarding-checklist/email-setup' ) ) {
		if ( hasTask( 'email_setup' ) ) {
			addTask( 'email_setup' );
		}

		if ( hasTask( 'email_forwarding_upgraded_to_gsuite' ) ) {
			addTask( 'email_forwarding_upgraded_to_gsuite' );
		}

		if ( hasTask( 'gsuite_tos_accepted' ) ) {
			addTask( 'gsuite_tos_accepted' );
		}
	}

	debug( 'Site info: ', { designType, segmentSlug, siteVerticals } );
	debug( 'Task list: ', tasks );

	return tasks;
}

class WpcomTaskList {
	constructor( tasks ) {
		this.tasks = tasks;
	}

	getAll() {
		return this.tasks;
	}

	get( taskId ) {
		return this.tasks.find( task => task.id === taskId );
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
		this.tasks = this.tasks.filter( task => task.id !== taskId );
		return found;
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
	params => new WpcomTaskList( getTasks( params ) ),
	params => {
		const key = pick( params, [
			'taskStatuses',
			'designType',
			'isSiteUnlaunched',
			'siteSegment',
			'siteVerticals',
		] );
		return JSON.stringify( key );
	}
);
