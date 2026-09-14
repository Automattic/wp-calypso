import { siteByIdQuery } from '@automattic/api-queries';
import { TimeSince } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import safeProtocolUrl from 'calypso/lib/safe-protocol-url';
import { getOldestAchievement } from '../utils';
import AchievementCard from './achievement-card';
import type { Achievement } from '@automattic/api-core';

export default function GenericAchievement( {
	achievement,
	achievements,
	isOwnProfile,
}: {
	achievement: Achievement;
	achievements: Achievement[];
	isOwnProfile: boolean;
} ) {
	const translate = useTranslate();
	const hasMultiple = achievements.filter( ( a ) => a.slug === achievement.slug ).length > 1;
	const oldest = hasMultiple ? getOldestAchievement( achievement.slug, achievements ) : undefined;
	const unlockDate = oldest?.date_unlocked ?? achievement.date_unlocked;
	const siteId = oldest?.site_ID ?? achievement.site_ID ?? 0;
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ),
		enabled: siteId !== 0,
	} );

	const caption = () => {
		if ( site ) {
			return hasMultiple
				? translate( 'First unlocked: {{timeSince/}} on {{a}}%(site)s{{/a}}', {
						args: { site: site.name },
						components: {
							timeSince: <TimeSince date={ unlockDate } />,
							a: <a href={ site.URL } target="_blank" rel="noopener noreferrer" />,
						},
				  } )
				: translate( 'Unlocked: {{timeSince/}} on {{a}}%(site)s{{/a}}', {
						args: { site: site.name },
						components: {
							timeSince: <TimeSince date={ unlockDate } />,
							a: <a href={ site.URL } target="_blank" rel="noopener noreferrer" />,
						},
				  } );
		}
		return hasMultiple
			? translate( 'First unlocked: {{timeSince/}}', {
					components: { timeSince: <TimeSince date={ unlockDate } /> },
			  } )
			: translate( 'Unlocked: {{timeSince/}}', {
					components: { timeSince: <TimeSince date={ unlockDate } /> },
			  } );
	};

	// Only own-profile reads carry `context`, and only on achievements the
	// backend can attribute to a specific post or comment. Link to the post or
	// comment depending on which IDs are present.
	const contextLink = () => {
		const context = achievement.context;
		if ( ! isOwnProfile || ! context?.url ) {
			return undefined;
		}
		const { blog_id, post_id, comment_id, url } = context;
		if ( ! ( blog_id > 0 ) || ! ( post_id > 0 ) ) {
			return undefined;
		}
		// `url` comes from an API payload — restrict it to http(s) so an unsafe
		// protocol (e.g. `javascript:`) can't be used as the anchor href.
		const safeUrl = safeProtocolUrl( url );
		if ( ! safeUrl ) {
			return undefined;
		}
		const isComment = !! comment_id && comment_id > 0;
		return isComment
			? translate( '{{a}}View comment{{/a}}', {
					components: { a: <a href={ safeUrl } target="_blank" rel="noopener noreferrer" /> },
			  } )
			: translate( '{{a}}View post{{/a}}', {
					components: { a: <a href={ safeUrl } target="_blank" rel="noopener noreferrer" /> },
			  } );
	};

	// The `automattician` achievement pins its `date_unlocked` to the 2012
	// launch, so old-timers all show the same legacy date. When the backend
	// supplies the real hire date, surface it alongside the unlock date.
	const hiredContext = () => {
		if ( achievement.slug !== 'automattician' ) {
			return undefined;
		}
		const dateHired = achievement.date_hired;
		if ( ! dateHired ) {
			return undefined;
		}
		const parsed = new Date( dateHired );
		if ( isNaN( parsed.getTime() ) ) {
			return undefined;
		}
		// `date_hired` is an absolute hire date (the backend sends it as a
		// UTC ISO 8601 timestamp), so format it in UTC — the displayed
		// calendar day must not shift with the viewer's timezone. `medium`
		// matches the short-month style TimeSince uses for the unlock date.
		const formatted = new Intl.DateTimeFormat( translate.localeSlug, {
			dateStyle: 'medium',
			timeZone: 'UTC',
		} ).format( parsed );
		return translate( 'Started: {{date/}}', {
			components: { date: <time dateTime={ dateHired }>{ formatted }</time> },
			comment: '{{date/}} is the date an Automattician was hired.',
		} );
	};

	const renderCaption = () => {
		const hired = hiredContext();
		const link = contextLink();
		if ( ! hired && ! link ) {
			return caption();
		}
		return (
			<>
				{ caption() }
				{ hired && <span className="achievement-card__caption-context">{ hired }</span> }
				{ link && <span className="achievement-card__caption-context">{ link }</span> }
			</>
		);
	};

	return (
		<AchievementCard
			image={ achievement.image }
			title={ achievement.name }
			badge={
				achievement.level > 0
					? translate( 'Level %(level)d', { args: { level: achievement.level } } )
					: undefined
			}
			isSecret={ achievement.is_secret }
			isRetired={ !! achievement.date_retired }
			isA8cOnly={ achievement.is_a8c_only }
			description={ achievement.description }
			caption={ renderCaption() }
		/>
	);
}
