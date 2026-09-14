import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useMemo } from 'react';
import { SocialAuthorProfileTabs, useTabSlug, type TabSpec } from 'calypso/reader/social';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { AtmosphereAuthorFeedFilter } from '@automattic/api-core';

const SLUG_TO_FILTER: Record< string, AtmosphereAuthorFeedFilter > = {
	posts: 'posts_no_replies',
	replies: 'posts_with_replies',
	media: 'posts_with_media',
};

const FILTER_TO_SLUG: Partial< Record< AtmosphereAuthorFeedFilter, string > > = {
	posts_no_replies: 'posts',
	posts_with_replies: 'replies',
	posts_with_media: 'media',
};

const ALLOWED_SLUGS = [ 'posts', 'replies', 'media' ] as const;
const DEFAULT_SLUG = 'posts';

/**
 * Reads `?tab=` from the current location and returns the corresponding
 * backend filter. The shared `useTabSlug` hook owns URL parsing and the
 * malformed-slug rewrite; this wrapper maps slug → atmosphere enum.
 */
export function useAuthorProfileFilter(): AtmosphereAuthorFeedFilter {
	const { slug } = useTabSlug( {
		allowedSlugs: ALLOWED_SLUGS,
		defaultSlug: DEFAULT_SLUG,
	} );
	return SLUG_TO_FILTER[ slug ] ?? SLUG_TO_FILTER[ DEFAULT_SLUG ];
}

interface AuthorProfileTabsProps {
	connectionId: number;
	actor: string;
	basePath: string;
	activeFilter: AtmosphereAuthorFeedFilter;
}

function buildPath( basePath: string, slug: string ): string {
	if ( typeof window === 'undefined' ) {
		return `${ basePath }?tab=${ slug }`;
	}
	// Preserve any other query params and the fragment (e.g. ?from=timeline,
	// or #scroll-anchor) the user may have on the URL when switching tabs.
	const params = new URLSearchParams( window.location.search );
	params.set( 'tab', slug );
	const hash = window.location.hash;
	return `${ basePath }?${ params.toString() }${ hash }`;
}

export function AuthorProfileTabs( {
	connectionId,
	actor,
	basePath,
	activeFilter,
}: AuthorProfileTabsProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const tabs: TabSpec[] = useMemo(
		() => [
			{
				slug: 'posts',
				title: translate( 'Posts' ) as TranslateResult,
				path: buildPath( basePath, 'posts' ),
			},
			{
				slug: 'replies',
				title: translate( 'Replies' ) as TranslateResult,
				path: buildPath( basePath, 'replies' ),
			},
			{
				slug: 'media',
				title: translate( 'Media' ) as TranslateResult,
				path: buildPath( basePath, 'media' ),
			},
		],
		[ basePath, translate ]
	);

	const activeSlug = FILTER_TO_SLUG[ activeFilter ] ?? DEFAULT_SLUG;

	return (
		<SocialAuthorProfileTabs
			className="atmosphere-author-profile-tabs"
			tabs={ tabs }
			activeSlug={ activeSlug }
			onTabClick={ ( toSlug, fromSlug ) => {
				dispatch(
					recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_filter_changed', {
						connection_id: connectionId,
						actor,
						from_filter: SLUG_TO_FILTER[ fromSlug ] ?? activeFilter,
						to_filter: SLUG_TO_FILTER[ toSlug ],
					} )
				);
			} }
		/>
	);
}
