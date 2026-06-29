import { readSiteQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { globe } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getSiteName } from 'calypso/reader/get-helpers';
import AchievementCard from './achievement-card';
import type { DailyPostStreak } from '@automattic/api-core';

function getHostname( url: string ): string {
	try {
		return new URL( url ).hostname;
	} catch {
		return url;
	}
}

export default function DailyPostStreakCard( { streak }: { streak: DailyPostStreak } ) {
	const translate = useTranslate();
	const { data: site } = useQuery( readSiteQuery( streak.blog_id ) );

	const siteName = ( site && getSiteName( { site } ) ) || getHostname( streak.url );
	const iconUrl = site?.icon?.img;

	const iconNode = iconUrl ? (
		<img className="achievement-card__icon achievement-card__icon--site" src={ iconUrl } alt="" />
	) : (
		<div className="achievement-card__icon achievement-card__icon--site-fallback">
			<Icon icon={ globe } />
		</div>
	);

	const description = translate(
		'%(count)d-day streak on {{link}}%(siteName)s{{/link}}.',
		'%(count)d-day streak on {{link}}%(siteName)s{{/link}}.',
		{
			count: streak.current_streak,
			args: { count: streak.current_streak, siteName },
			components: {
				link: (
					// eslint-disable-next-line jsx-a11y/anchor-has-content
					<a href={ streak.url } target="_blank" rel="noopener noreferrer" />
				),
			},
		}
	);

	return (
		<AchievementCard
			className="is-daily-post-streak"
			iconNode={ iconNode }
			title={ translate( 'Daily Post Streak' ) }
			description={ description }
		/>
	);
}
