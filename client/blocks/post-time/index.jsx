/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getNormalizedPost } from 'state/posts/selectors';

function getDisplayedTimeFromPost( moment, post ) {
	if ( ! post ) {
		// Placeholder text: "a few seconds ago" in English locale
		return moment().fromNow();
	}

	const { status, modified, date } = post;
	const time = moment(
		includes( [ 'draft', 'pending' ], status )
			? modified
			: date
	);
	if ( time.isBefore( moment().subtract( 7, 'days' ) ) ) {
		// Like "August 30, 2017 4:46 PM" in English locale
		return time.format( 'LLL' );
	}

	// Like "3 days ago" in English locale
	return time.fromNow();
}

export function PostTime( { moment, post } ) {
	const classes = classNames( 'post-time', {
		'is-placeholder': ! post
	} );

	return (
		<span className={ classes }>
			{ getDisplayedTimeFromPost( moment, post ) }
		</span>
	);
}

PostTime.propTypes = {
	globalId: PropTypes.string,
	moment: PropTypes.func,
	post: PropTypes.object
};

export default connect( ( state, { globalId } ) => {
	return {
		post: getNormalizedPost( state, globalId )
	};
} )( localize( PostTime ) );
