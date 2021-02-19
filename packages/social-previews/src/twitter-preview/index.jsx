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
		// Previous versions expected passed props to be the Twitter Card details for a single tweet,
		// rather than an array of tweets. If the tweet array isn't passed, we can construct it from
		// the old props.
		const tweets = this.props.tweets || [
			{
				text: '',
				media: [],
				card: {
					...this.props,
					type: 'large_image_summary' === this.props.type ? 'summary_large_image' : this.props.type,
				},
				date: Date.now(),
				name: 'Account Name',
				profileImage:
					'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png',
				screenName: '@account',
			},
		];

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
