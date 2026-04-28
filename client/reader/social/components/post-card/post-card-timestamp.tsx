import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

interface PostCardTimestampProps {
	post: { created_at: string; indexed_at: string };
}

// Renders the post's timestamp as an inert standalone block under the body
// (no anchor, no card-link plumbing). Used by SocialPostCard when
// prominentTimestamp is set — i.e. on the thread-view target post — so the
// layout matches bsky.app: header has author-only, timestamp lives between
// the body / embed and the counts row.
//
// bsky.app shows the absolute time + date here ("3:17 PM · Apr 28, 2026"),
// not a relative "Xm ago" string. That's the right call for the single-post
// detail view: a reader landing here from a notification or a share link
// wants to know exactly when this was posted, not how recent it is relative
// to now.
export function PostCardTimestamp( { post }: PostCardTimestampProps ) {
	const translate = useTranslate();
	const timestampIso = post.created_at || post.indexed_at;

	const formatted = useMemo( () => {
		if ( ! timestampIso ) {
			return '';
		}
		const date = new Date( timestampIso );
		if ( Number.isNaN( date.getTime() ) ) {
			return '';
		}
		const time = new Intl.DateTimeFormat( undefined, {
			hour: 'numeric',
			minute: '2-digit',
		} ).format( date );
		const fullDate = new Intl.DateTimeFormat( undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		} ).format( date );
		return translate( '%(time)s · %(date)s', {
			args: { time, date: fullDate },
			comment:
				'Absolute timestamp shown under a single Bluesky post — e.g. "3:17 PM · Apr 28, 2026".',
		} ) as string;
	}, [ timestampIso, translate ] );

	if ( ! formatted ) {
		return null;
	}

	return (
		<time className="social-post-card-timestamp" dateTime={ timestampIso }>
			{ formatted }
		</time>
	);
}
