import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

interface PostCardTimestampProps {
	post: { created_at: string; indexed_at: string | null };
}

export function PostCardTimestamp( { post }: PostCardTimestampProps ) {
	const translate = useTranslate();
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

	return (
		<time className="social-post-card-timestamp" dateTime={ timestampIso }>
			{ formatted }
		</time>
	);
}
