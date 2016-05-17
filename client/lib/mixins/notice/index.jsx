import React from 'react';
import { successNotice, errorNotice, infoNotice, warningNotice, updateNotice, removeNotice } from 'state/notices/actions';
import invariant from 'invariant';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import escapeRegexp from 'lodash/escapeRegexp';

function getDisplayName( component ) {
	return (
		component.displayName ||
		component.constructor.displayName ||
		component.constructor.name ||
		'Component'
	);
}

function forceIncludeIdPrefix( noticeActionCreator, idPrefix, store ) {
	return ( text, options = {} ) => {
		let noticeOptions = Object.assign( {}, options );

		if ( options.id ) {
			noticeOptions.id = idPrefix + '--' + options.id;
		} else {
			noticeOptions.id = uniqueId( idPrefix + '--' );
		}

		store.dispatch( noticeActionCreator( text, noticeOptions ) );

		return noticeOptions.id;
	};
}

function bindRemoveNotice( store ) {
	return ( noticeId ) => {
		store.dispatch( removeNotice( noticeId ) );
	};
}

export function getHelpers( component, idPrefix ) {
	const store = component.props.store || component.context.store;
	const componentDisplayName = getDisplayName( component );

	invariant( store,
      `Could not find "store" in either the context or props of "${componentDisplayName}.` +
      `Either wrap the root component in a <Provider>, ` +
      `or explicitly pass "store" as a prop to "${componentDisplayName}".`
    );

	const regexPrefix = new RegExp( '^' + escapeRegexp( idPrefix ) + '--' );
	let previousNoticeId;
	let helpers = { };

	helpers.unsubscribe = component.context.store.subscribe( () => {
		const noticeId = get( component.context.store.getState(), 'notices.lastClicked' );

		if ( previousNoticeId === noticeId ) {
			return;
		}

		previousNoticeId = noticeId;

		let promise;

		if ( noticeId && regexPrefix.test( noticeId ) && typeof component.onNoticeActionClick === 'function' ) {
			promise = Promise.resolve( component.onNoticeActionClick( noticeId ) );
		} else {
			promise = Promise.resolve( true );
		}

		promise.then( () => helpers.removeNotice( noticeId ) );
	} );

	helpers.success = forceIncludeIdPrefix( successNotice, idPrefix, store );
	helpers.error = forceIncludeIdPrefix( errorNotice, idPrefix, store );
	helpers.info = forceIncludeIdPrefix( infoNotice, idPrefix, store );
	helpers.warning = forceIncludeIdPrefix( warningNotice, idPrefix, store );
	helpers.update = forceIncludeIdPrefix( updateNotice, idPrefix, store );
	helpers.removeNotice = bindRemoveNotice( store );

	return helpers;
}

export default ( idPrefix ) => {
	return {
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
			this.notices.removeNotice( noticeID );
		},
		*/

		componentDidMount() {
			this.notices = getHelpers( this, idPrefix );
		},

		componentWillUnmount() {
			this.notices.unsubscribe();
		}
	};
};

