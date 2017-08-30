/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { getNormalizedPost } from 'state/posts/selectors';

export function PostTime( { moment, post } ) {
	let timeDisplay;

	if ( post ) {
		const { status, modified, date } = post;
		const time = moment(
			includes( [ 'draft', 'pending' ], status )
				? modified
				: date
		);
		if ( time.isBefore( moment().subtract( 7, 'days' ) ) ) {
			// "August 30, 2017 4:46 PM" in English locale
			timeDisplay = time.format( 'LLL' );
		} else {
			// "3 days ago" in English locale
			timeDisplay = time.fromNow();
		}
	} else {
		// Placeholder text: "a few seconds ago" in English locale
		timeDisplay = moment().fromNow();
	}

	const classes = classNames( 'post-time', {
		'is-placeholder': ! post
	} );

	return (
		<span className={ classes }>
			{ timeDisplay }
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
