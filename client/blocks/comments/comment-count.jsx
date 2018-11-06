/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';

const CommentCount = ( { count, translate } ) => {
	let countPhrase;
	if ( count > 0 ) {
		countPhrase = translate( '%(commentCount)d comment', '%(commentCount)d comments', {
			count,
			args: {
				commentCount: count,
			},
		} );
	} else {
		countPhrase = translate( 'No comments' );
	}

	return (
		<div className="comments__comment-count">
			<span className="comments__comment-count-phrase">{ countPhrase }</span>
			{ count === 0 &&
				'- ' +
					translate( 'add the first!', {
						context: 'Used after "no comments", inviting user to add the first comment',
					} ) }
		</div>
	);
};

CommentCount.propTypes = {
	count: PropTypes.number.isRequired,
};

export default localize( CommentCount );
