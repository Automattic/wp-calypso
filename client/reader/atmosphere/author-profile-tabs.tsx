import page from '@automattic/calypso-router';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useEffect, useMemo, useRef } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { AtmosphereAuthorFeedFilter } from '@automattic/api-core';

const SLUG_TO_FILTER: Record< string, AtmosphereAuthorFeedFilter > = {
	posts: 'posts_no_replies',
	replies: 'posts_with_replies',
	media: 'posts_with_media',
};

const DEFAULT_FILTER: AtmosphereAuthorFeedFilter = 'posts_no_replies';
const DEFAULT_SLUG = 'posts';

function readSearch(): URLSearchParams {
	if ( typeof window === 'undefined' ) {
		return new URLSearchParams();
	}
	return new URLSearchParams( window.location.search );
}

function readPathname(): string {
	if ( typeof window === 'undefined' ) {
		return '';
	}
	return window.location.pathname;
}

/**
 * Reads `?tab=` from the current location and returns the corresponding
 * backend enum filter. Side-effects a single `page.replace` to the default
 * tab when the slug is malformed (gated on a ref so repeated renders with
 * the same malformed value don't loop). If the user navigates to a valid
 * tab and then back to a different malformed value, the rewrite re-fires —
 * the gate clears once a valid slug appears. Returns the default filter on
 * missing or malformed values.
 */
export function useAuthorProfileFilter(): AtmosphereAuthorFeedFilter {
	const correctedFor = useRef< string | null >( null );

	const search = readSearch();
	const slug = search.get( 'tab' );

	useEffect( () => {
		if ( slug === null ) {
			return;
		}
		if ( Object.hasOwn( SLUG_TO_FILTER, slug ) ) {
			correctedFor.current = null;
			return;
		}
		if ( correctedFor.current === slug ) {
			return;
		}
		// Re-validate against the live URL: between render and effect commit
		// another `page.replace` (e.g. a same-batch tab click) could have
		// changed `?tab=` to a valid value. Without this guard the effect
		// would clobber the user's valid choice with the default.
		const liveSearch = readSearch();
		const liveSlug = liveSearch.get( 'tab' );
		if ( liveSlug === null || Object.hasOwn( SLUG_TO_FILTER, liveSlug ) ) {
			return;
		}
		correctedFor.current = liveSlug;
		const next = new URLSearchParams( liveSearch );
		next.set( 'tab', DEFAULT_SLUG );
		page.replace( `${ readPathname() }?${ next.toString() }` );
	}, [ slug ] );

	if ( slug === null ) {
		return DEFAULT_FILTER;
	}
	if ( Object.hasOwn( SLUG_TO_FILTER, slug ) ) {
		return SLUG_TO_FILTER[ slug ];
	}
	return DEFAULT_FILTER;
}

interface AuthorProfileTabsProps {
	connectionId: number;
	actor: string;
	activeFilter: AtmosphereAuthorFeedFilter;
}

interface TabSpec {
	filter: AtmosphereAuthorFeedFilter;
	slug: string;
	title: TranslateResult;
	path: string;
}

// Intentionally separate from route.ts's `getProfileUrl` — that helper
// validates handle/DID and returns null on invalid; we always have a
// resolved actor here and need to append the ?tab slug.
function buildPath( connectionId: number, actor: string, slug: string ): string {
	const base = `/reader/atmosphere/${ connectionId }/profile/${ encodeURIComponent( actor ) }`;
	if ( typeof window === 'undefined' ) {
		return `${ base }?tab=${ slug }`;
	}
	// Preserve any other query params and the fragment (e.g. ?from=timeline,
	// or #scroll-anchor) that the user may have on the URL when switching
	// tabs. Mirrors the malformed-rewrite path's URL-preservation behavior.
	const params = new URLSearchParams( window.location.search );
	params.set( 'tab', slug );
	const hash = window.location.hash; // includes leading '#' or '' if absent
	return `${ base }?${ params.toString() }${ hash }`;
}

function isPlainLeftClick( event: React.MouseEvent ): boolean {
	return (
		event.button === 0 && ! event.metaKey && ! event.ctrlKey && ! event.shiftKey && ! event.altKey
	);
}

export function AuthorProfileTabs( { connectionId, actor, activeFilter }: AuthorProfileTabsProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const tabs: TabSpec[] = useMemo(
		() => [
			{
				filter: 'posts_no_replies',
				slug: 'posts',
				title: translate( 'Posts' ),
				path: buildPath( connectionId, actor, 'posts' ),
			},
			{
				filter: 'posts_with_replies',
				slug: 'replies',
				title: translate( 'Replies' ),
				path: buildPath( connectionId, actor, 'replies' ),
			},
			{
				filter: 'posts_with_media',
				slug: 'media',
				title: translate( 'Media' ),
				path: buildPath( connectionId, actor, 'media' ),
			},
		],
		[ connectionId, actor, translate ]
	);

	// posts_and_author_threads is not surfaced as a UI tab. If a caller
	// somehow passes it (or any future enum value the type allows but the
	// UI hasn't onboarded yet), default to Posts visually rather than
	// render no selection at all.
	const selected = tabs.find( ( tab ) => tab.filter === activeFilter ) ?? tabs[ 0 ];

	const handleClick = ( event: React.MouseEvent< HTMLAnchorElement >, tab: TabSpec ) => {
		if ( ! isPlainLeftClick( event ) ) {
			return;
		}
		event.preventDefault();
		if ( tab.filter === activeFilter ) {
			return;
		}
		page.replace( tab.path );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_filter_changed', {
				connection_id: connectionId,
				actor,
				from_filter: activeFilter,
				to_filter: tab.filter,
			} )
		);
	};

	return (
		<SectionNav
			className="atmosphere-author-profile-tabs"
			selectedText={ selected.title }
			variation="minimal"
			enforceTabsView
		>
			<NavTabs hasHorizontalScroll>
				{ tabs.map( ( tab ) => (
					<NavItem
						key={ tab.slug }
						path={ tab.path }
						selected={ tab.filter === selected.filter }
						onClick={ ( event: React.MouseEvent< HTMLAnchorElement > ) =>
							handleClick( event, tab )
						}
					>
						{ tab.title }
					</NavItem>
				) ) }
			</NavTabs>
		</SectionNav>
	);
}
