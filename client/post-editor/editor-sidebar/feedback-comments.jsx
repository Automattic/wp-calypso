/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

export function FeedbackComments( { comments } ) {
	return (
		<ol>
			{ comments.map(
				// NOTE: It should be OK to use the index for `key` because
				// the list is currently append-only
				( comment, index ) =>
					<li key={ index }>
						{ comment }
					</li>,
			) }
		</ol>
	);
}

FeedbackComments.propTypes = {
	comments: PropTypes.arrayOf( PropTypes.string ).isRequired,
};

export default FeedbackComments;
