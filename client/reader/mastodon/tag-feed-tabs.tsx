import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useMemo } from 'react';
import { SocialAuthorProfileTabs, useTabSlug, type TabSpec } from 'calypso/reader/social';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { MastodonTagFilter } from '@automattic/api-core';

const ALLOWED_SLUGS = [ 'all', 'media', 'local' ] as const;
const DEFAULT_SLUG = 'all';

const SLUG_TO_FILTER: Record< string, MastodonTagFilter > = {
	all: 'all',
	media: 'media',
	local: 'local',
};

const FILTER_TO_SLUG: Record< MastodonTagFilter, string > = {
	all: 'all',
	media: 'media',
	local: 'local',
};

/**
 * Reads `?tab=` from the current location and returns the corresponding
 * Mastodon tag filter. Delegates URL parsing + malformed-slug rewrite to
 * the shared `useTabSlug` hook.
 */
export function useMastodonTagFilter(): MastodonTagFilter {
	const { slug } = useTabSlug( {
		allowedSlugs: ALLOWED_SLUGS,
		defaultSlug: DEFAULT_SLUG,
	} );
	return SLUG_TO_FILTER[ slug ] ?? SLUG_TO_FILTER[ DEFAULT_SLUG ];
}

interface MastodonTagFeedTabsProps {
	connectionId: number;
	hashtag: string;
	activeFilter: MastodonTagFilter;
}

function buildPath( connectionId: number, hashtag: string, slug: string ): string {
	const base = `/reader/mastodon/${ connectionId }/tag/${ encodeURIComponent( hashtag ) }`;
	if ( typeof window === 'undefined' ) {
		return `${ base }?tab=${ slug }`;
	}
	// Preserve any other query params and the fragment so switching tabs
	// doesn't drop user-relevant URL state. Mirrors the malformed-rewrite
	// path's URL preservation in useTabSlug.
	const params = new URLSearchParams( window.location.search );
	params.set( 'tab', slug );
	const hash = window.location.hash;
	return `${ base }?${ params.toString() }${ hash }`;
}

export function MastodonTagFeedTabs( {
	connectionId,
	hashtag,
	activeFilter,
}: MastodonTagFeedTabsProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const tabs: TabSpec[] = useMemo(
		() => [
			{
				slug: 'all',
				title: translate( 'All' ) as TranslateResult,
				path: buildPath( connectionId, hashtag, 'all' ),
			},
			{
				slug: 'media',
				title: translate( 'Media' ) as TranslateResult,
				path: buildPath( connectionId, hashtag, 'media' ),
			},
			{
				slug: 'local',
				title: translate( 'Local' ) as TranslateResult,
				path: buildPath( connectionId, hashtag, 'local' ),
			},
		],
		[ connectionId, hashtag, translate ]
	);

	const activeSlug = FILTER_TO_SLUG[ activeFilter ];

	return (
		<SocialAuthorProfileTabs
			className="mastodon-tag-feed-tabs"
			tabs={ tabs }
			activeSlug={ activeSlug }
			onTabClick={ ( toSlug, fromSlug ) => {
				dispatch(
					recordReaderTracksEvent( 'calypso_reader_mastodon_tag_filter_changed', {
						connection_id: connectionId,
						hashtag,
						from_filter: SLUG_TO_FILTER[ fromSlug ] ?? activeFilter,
						to_filter: SLUG_TO_FILTER[ toSlug ] ?? activeFilter,
					} )
				);
			} }
		/>
	);
}
