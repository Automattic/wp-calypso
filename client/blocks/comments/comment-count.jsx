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
		countPhrase = translate(
			'{{span}}%(commentCount)d comment{{/span}}',
			'{{span}}%(commentCount)d comments{{/span}}',
			{
				count,
				args: {
					commentCount: count,
				},
				components: {
					span: <span className="comments__comment-count-phrase" />,
				},
			}
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
