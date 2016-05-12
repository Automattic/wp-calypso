import React from 'react';
import { successNotice, errorNotice, infoNotice, warningNotice, updateNotice, removeNotice } from 'state/notices/actions';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import escapeRegexp from 'lodash/escapeRegexp';

function forceIncludeIdPrefix( idPrefix, noticeActionCreator ) {
	return function( text, options = {} ) {
		options = Object.assign( {}, options );

		if ( options.id ) {
			options.id = idPrefix + '--' + options.id;
		} else {
			options.id = uniqueId( idPrefix + '--' );
		}

		this.context.store.dispatch( noticeActionCreator( text, options ) );
	};
}

export default ( idPrefix ) => {
	const regexPrefix = new RegExp( '^' + escapeRegexp( idPrefix ) + '--' );
	let unsubscribe;
	let previousNoticeId;
	let noticeMixin = {
		contextTypes: {
			store: React.PropTypes.object.isRequired,
		},

		/**
		 * This function will be called whenever an action button in Global Notices is clicked.
		 * If you want to do something when the button is clicked, define the following method.
		 * @param {String} noticeID the id of the notice that contains clicked action button.
		 */
		/*
		onNoticeActionClick( noticeID ) {
			this.removeNotice( noticeID );
		},
		*/

		componentDidMount() {
			unsubscribe = this.context.store.subscribe( () => {
				const state = this.context.store.getState();
				const noticeId = get( state, 'notices.clicked' );

				if ( previousNoticeId === noticeId ) {
					return;
				}

				previousNoticeId = noticeId;

				let promise;

				if ( noticeId && regexPrefix.test( noticeId ) && typeof this.onNoticeActionClick === 'function' ) {
					promise = Promise.resolve( this.onNoticeActionClick( noticeId ) );
				} else {
					promise = Promise.resolve( true );
				}

				promise.then( () => this.removeNotice( noticeId ) );
			} );
		},

		componentWillUnmount() {
			unsubscribe();
		},
	};

	noticeMixin.successNotice = forceIncludeIdPrefix( idPrefix, successNotice );
	noticeMixin.errorNotice = forceIncludeIdPrefix( idPrefix, errorNotice );
	noticeMixin.infoNotice = forceIncludeIdPrefix( idPrefix, infoNotice );
	noticeMixin.warningNotice = forceIncludeIdPrefix( idPrefix, warningNotice );
	noticeMixin.updateNotice = forceIncludeIdPrefix( idPrefix, updateNotice );
	noticeMixin.removeNotice = function( noticeID ) {
		this.context.store.dispatch( removeNotice( noticeID ) );
	};

	return noticeMixin;
};
