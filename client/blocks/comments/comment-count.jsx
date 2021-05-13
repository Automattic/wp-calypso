/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './comment-count.scss';

const CommentCount = ( { count, translate } ) => {
	let countPhrase;
	if ( count > 0 ) {
		countPhrase = (
			<span className="comments__comment-count-phrase">
				{ translate( '%(commentCount)d comment', '%(commentCount)d comments', {
					count,
					args: {
						commentCount: count,
					},
				} ) }
			</span>
		);
	} else {
		countPhrase = translate( '{{span}}No comments{{/span}} - add the first!', {
			components: {
				span: <span className="comments__comment-count-phrase" />,
			},
		} );
	}

	return <div className="comments__comment-count">{ countPhrase }</div>;
};

CommentCount.propTypes = {
	count: PropTypes.number.isRequired,
};

export default localize( CommentCount );
