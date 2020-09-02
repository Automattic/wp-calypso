/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { Tweet } from './tweet';

/**
 * Style dependencies
 */
import './style.scss';

export class TwitterPreview extends PureComponent {
	render() {
		const { tweets } = this.props;

		return (
			<div className="twitter-preview">
				{ tweets &&
					tweets.map( ( tweet, index ) => {
						return (
							<Tweet
								key={ `twitter-preview__tweet-${ index }` }
								isLast={ index + 1 === tweets.length }
								{ ...tweet }
							/>
						);
					} ) }
			</div>
		);
	}
}

TwitterPreview.propTypes = {
	tweets: PropTypes.array,
};

export default TwitterPreview;
