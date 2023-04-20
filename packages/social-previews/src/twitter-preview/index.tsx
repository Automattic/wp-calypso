import { useMemo } from 'react';
import { Tweet } from './tweet';
import { TwitterPreviewProps } from './types';

import './style.scss';

export const TwitterPreview: React.FC< TwitterPreviewProps > = ( props ) => {
	// Previous versions expected passed props to be the Twitter Card details for a single tweet,
	// rather than an array of tweets. If the tweet array isn't passed, we can construct it from
	// the old props.
	const tweets = useMemo(
		() =>
			props.tweets || [
				{
					text: '',
					media: [],
					card: {
						...props,
						type: 'large_image_summary' === props.type ? 'summary_large_image' : props.type,
					},
					date: Date.now(),
					name: 'Account Name',
					profileImage:
						'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png',
					screenName: '@account',
				},
			],
		[ props ]
	);

	return (
		<div className="twitter-preview">
			{ tweets?.map( ( tweet, index ) => {
				return (
					<Tweet
						key={ `twitter-preview__tweet-${ index }` }
						{ ...tweet }
						isLast={ index + 1 === tweets.length }
					/>
				);
			} ) }
		</div>
	);
};
