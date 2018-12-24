/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getNormalizedPost } from 'state/posts/selectors';

function getPostTimeDetails( moment, post ) {
	const { status, modified, date } = post;
	const time = moment( includes( [ 'draft', 'pending' ], status ) ? modified : date );
	const isOlderThan7Days = time.isBefore( moment().subtract( 7, 'days' ) );

	return {
		time,
		isOlderThan7Days,
	};
}

function getDisplayedTimeFromPost( moment, post ) {
	if ( ! post ) {
		// Placeholder text: "a few seconds ago" in English locale
		return moment().fromNow();
	}

	const { time, isOlderThan7Days } = getPostTimeDetails( moment, post );
	if ( isOlderThan7Days ) {
		// Like "Mar 15, 2013 6:23 PM" in English locale
		return time.format( 'lll' );
	}

	// Like "3 days ago" in English locale
	return time.fromNow();
}

function getDisplayedTimeTitleFromPost( moment, post ) {
	if ( ! post ) {
		// Don't display the title
		return null;
	}

	const { time, isOlderThan7Days } = getPostTimeDetails( moment, post );
	if ( isOlderThan7Days ) {
		// Don't display the title, the time displayed is already in machine format
		return null;
	}

	// Like "Mar 15, 2013 6:23 PM" in English locale
	return time.format( 'lll' );
}

export function PostTime( { moment, post } ) {
	const classes = classNames( 'post-time', {
		'is-placeholder': ! post,
	} );

	return (
		<span title={ getDisplayedTimeTitleFromPost( moment, post ) } className={ classes }>
			{ getDisplayedTimeFromPost( moment, post ) }
		</span>
	);
}

PostTime.propTypes = {
	globalId: PropTypes.string,
	moment: PropTypes.func,
	post: PropTypes.object,
};

export default connect( ( state, { globalId } ) => {
	return {
		post: getNormalizedPost( state, globalId ),
	};
} )( localize( PostTime ) );
