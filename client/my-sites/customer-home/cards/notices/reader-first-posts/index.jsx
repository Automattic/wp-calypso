import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { NOTICE_READER_FIRST_POSTS } from 'calypso/my-sites/customer-home/cards/constants';

const ReaderFirstPosts = () => {
	const translate = useTranslate();
	// @TODO: Add Tracks events.
	return (
		<Card className="reader-first-posts__nudge">
			<TrackComponentView
				eventName="calypso_my_home_reader_first_posts_nudge_view"
				eventProperties={ {
					id: NOTICE_READER_FIRST_POSTS,
				} }
			/>
			<h2>{ translate( 'Looking for inspiration?' ) }</h2>
			<p>{ translate( 'See what other brand new sites are writing about.' ) }</p>
			<Button primary onClick={ () => clickButton() } className="reader-first-posts__button">
				{ translate( 'Take a look' ) }
			</Button>
		</Card>
	);
};

export default ReaderFirstPosts;
