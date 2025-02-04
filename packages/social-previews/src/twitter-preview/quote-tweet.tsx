import { SandBox } from '@wordpress/components';
import { QuoteTweetProps } from './types';

export const QuoteTweet: React.FC< QuoteTweetProps > = ( { tweet } ) => {
	if ( ! tweet ) {
		return null;
	}

	return (
		<div className="twitter-preview__quote-tweet">
			<SandBox
				html={ `<blockquote class="twitter-tweet" data-conversation="none" data-dnt="true"><a href="${ tweet }"></a></blockquote>` }
				scripts={ [ 'https://platform.twitter.com/widgets.js' ] }
				title="Embedded tweet"
			/>
			<div className="twitter-preview__quote-tweet-overlay" />
		</div>
	);
};
