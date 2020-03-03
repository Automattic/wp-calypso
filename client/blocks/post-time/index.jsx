/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getNormalizedPost } from 'state/posts/selectors';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

function getDisplayedTimeFromPost( moment, post ) {
	const now = moment();

	if ( ! post ) {
		// Placeholder text: "a few seconds ago" in English locale
		return now.fromNow();
	}

	const { status, modified, date } = post;
	const time = moment( includes( [ 'draft', 'pending' ], status ) ? modified : date );
	if ( now.diff( time, 'days' ) >= 7 ) {
		// Like "Mar 15, 2013 6:23 PM" in English locale
		return time.format( 'lll' );
	}

	// Like "3 days ago" in English locale
	return time.fromNow();
}

export function PostTime( { moment, post } ) {
	const classes = classNames( 'post-time', { 'is-placeholder': ! post } );
	const displayedTime = getDisplayedTimeFromPost( moment, post );

	return <span className={ classes }>{ displayedTime }</span>;
}

PostTime.propTypes = {
	globalId: PropTypes.string,
	moment: PropTypes.func,
	post: PropTypes.object,
};

export default connect( ( state, { globalId } ) => ( {
	post: getNormalizedPost( state, globalId ),
} ) )( withLocalizedMoment( PostTime ) );
