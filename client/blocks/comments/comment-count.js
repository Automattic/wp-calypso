/**
 * External dependencies
 */
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
			<span className="comments__comment-count-phrase">
				{ countPhrase }
			</span>
			{ count === 0 && translate( ' - Add the first! ' ) }
		</div>
	);
};

CommentCount.propTypes = {
	count: React.PropTypes.number.isRequired,
};

export default localize( CommentCount );
