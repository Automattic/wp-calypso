import { Card } from './card';
import { Footer } from './footer';
import { Header } from './header';
import { Media } from './media';
import { QuoteTweet } from './quote-tweet';
import { Sidebar } from './sidebar';
import { Text } from './text';
import { TweetProps } from './types';

import './style.scss';

export const Tweet: React.FC< TweetProps > = ( {
	isLast,
	profileImage,
	name,
	screenName,
	date,
	text,
	media,
	tweet,
	card,
} ) => {
	return (
		<div className="twitter-preview__container">
			<Sidebar profileImage={ profileImage } isLast={ isLast } />
			<div className="twitter-preview__main">
				<Header name={ name } screenName={ screenName } date={ date } />
				<div className="twitter-preview__content">
					<Text text={ text } cardUrl={ card?.url || '' } />
					<Media media={ media } />
					<QuoteTweet tweet={ tweet } />
					<Card card={ card } />
				</div>
				<Footer />
			</div>
		</div>
	);
};
