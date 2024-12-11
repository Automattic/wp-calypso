import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { NOTICE_READER_FIRST_POSTS } from 'calypso/my-sites/customer-home/cards/constants';

import './style.scss';

const ReaderFirstPosts = () => {
	const translate = useTranslate();

	const clickButton = () => {
		recordTracksEvent( 'calypso_my_home_reader_first_posts_nudge_click', {
			id: NOTICE_READER_FIRST_POSTS,
		} );
	};

	return (
		<Card className="reader-first-posts__nudge customer-home__card is-small-hero">
			<TrackComponentView
				eventName="calypso_my_home_reader_first_posts_nudge_view"
				eventProperties={ {
					id: NOTICE_READER_FIRST_POSTS,
				} }
			/>
			<div className="reader-first-posts__content">
				<h2 className="reader-first-posts__title">{ translate( 'Looking for inspiration?' ) }</h2>
				<p className="reader-first-posts__body">
					{ translate( 'See what other brand new sites are writing about.' ) }
				</p>
			</div>
			<div className="reader-first-posts__actions">
				<Button
					primary
					onClick={ () => clickButton() }
					className="reader-first-posts__button"
					href="/discover?selectedTab=firstposts"
				>
					{ translate( 'Take a look' ) }
				</Button>
			</div>
		</Card>
	);
};

export default ReaderFirstPosts;
