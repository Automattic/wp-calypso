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

export class TwitterThreadPreview extends PureComponent {
	render() {
		const { tweets } = this.props;

		return (
			<div className="twitter-thread-preview">
				{ tweets &&
					tweets.map( ( tweet, index ) => {
						return (
							<Tweet
								key={ `twitter-thread-preview__tweet-${ index }` }
								isLast={ index + 1 === tweets.length }
								{ ...tweet }
							/>
						);
					} ) }
			</div>
		);
	}
}

TwitterThreadPreview.propTypes = {
	tweets: PropTypes.array,
};

export default TwitterThreadPreview;
