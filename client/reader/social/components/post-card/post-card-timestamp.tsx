import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSocialAnalytics } from './analytics-context';

interface PostCardTimestampProps {
	post: {
		created_at: string;
		indexed_at: string | null;
		permalink: string;
		uri: string;
	};
}

export function PostCardTimestamp( { post }: PostCardTimestampProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const locale = getLocaleSlug() ?? undefined;
	const timestampIso = post.created_at || post.indexed_at || '';

	const formatted = useMemo( () => {
		if ( ! timestampIso ) {
			return '';
		}
		const date = new Date( timestampIso );
		if ( Number.isNaN( date.getTime() ) ) {
			return '';
		}
		const time = new Intl.DateTimeFormat( locale, {
			hour: 'numeric',
			minute: '2-digit',
		} ).format( date );
		const fullDate = new Intl.DateTimeFormat( locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		} ).format( date );
		return translate( '%(time)s · %(date)s', {
			args: { time, date: fullDate },
			comment:
				'Absolute timestamp shown under a single Bluesky post — e.g. "3:17 PM · Apr 28, 2026".',
		} ) as string;
	}, [ timestampIso, translate, locale ] );

	if ( ! formatted ) {
		return null;
	}

	const time = (
		<time className="social-post-card-timestamp" dateTime={ timestampIso }>
			{ formatted }
		</time>
	);

	if ( ! post.permalink ) {
		return time;
	}

	const handleClick = () => {
		if ( ! analytics ) {
			return;
		}
		// Subcomponents emit `_timeline_*`; per-protocol thread shells rewrite
		// the prefix to `_thread_*`. The "external" segment marks this as the
		// always-leaves-the-app variant, distinct from the inline timestamp's
		// in-app-thread-or-fallback `_post_clicked` event.
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_external_post_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: post.uri,
			destination: 'external',
		} );
	};

	return (
		<a
			className="social-post-card-timestamp-link"
			href={ post.permalink }
			target="_blank"
			rel="noopener noreferrer"
			aria-label={
				translate( '%(timestamp)s — view original post (opens in a new tab)', {
					args: { timestamp: formatted },
					comment:
						'Accessible name for the prominent timestamp link on a single social post; "%(timestamp)s" is e.g. "3:17 PM · Apr 28, 2026".',
				} ) as string
			}
			onClick={ handleClick }
		>
			{ time }
		</a>
	);
}
