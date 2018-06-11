/** @format */

/**
 * External dependencies
 */

import { cloneDeep, isEqual, map, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_PROGRESS_UPDATE } from 'state/action-types';
import { getSignupProgress } from 'state/signup/progress/selectors';

const SignupProgressStore = {
	subscribers: new Map(),

	get() {
		return cloneDeep( getSignupProgress( this.reduxStore.getState() ) );
	},
	omitUserData( progress ) {
		return map( progress, step => {
			return omit( step, 'userData' );
		} );
	},
	on( eventName, callback ) {
		if ( eventName === 'change' ) {
			this.subscribe( callback );
		}
	},
	off( ...params ) {
		this.unsubscribe( ...params );
	},
	reset() {
		this.reduxStore.dispatch( {
			type: SIGNUP_COMPLETE_RESET,
		} );
		// Unsubscribe all listeners
		[ ...this.subscribers.keys() ].forEach( key => this.unsubscribe( key ) );
	},
	set( input ) {
		this.reduxStore.dispatch( {
			type: SIGNUP_PROGRESS_UPDATE,
			data: this.omitUserData( input ),
		} );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	},
	subscribe( callback ) {
		this.currentValue = this.get();
		const unsubscribeFn = this.reduxStore.subscribe( () => {
			const previousProgress = this.currentValue;
			this.currentValue = SignupProgressStore.get();
			if ( ! isEqual( previousProgress, this._currentProgress ) ) {
				callback( this.currentValue );
			}
		} );
		this.subscribers.set( callback, unsubscribeFn );
	},
	unsubscribe( callback ) {
		if ( this.subscribers.has( callback ) ) {
			// NOTE: Executing the function stored at this key unsubscribes the listener
			this.subscribers.get( callback )();
			this.subscribers.delete( callback );
		}
	},
};

export default SignupProgressStore;
