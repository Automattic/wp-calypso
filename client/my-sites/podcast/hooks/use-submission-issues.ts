import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestMediaItem } from 'calypso/state/media/actions';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useHasPublishedEpisode } from './use-has-published-episode';

export type PodcastFieldValues = {
	podcasting_category_id?: string | number;
	podcasting_title?: string;
	podcasting_summary?: string;
	podcasting_talent_name?: string;
	podcasting_email?: string;
	podcasting_category_1?: string | number;
	podcasting_image_id?: string | number;
};

export type PodcastCoverImage = {
	width?: number;
	height?: number;
	mime_type?: string;
} | null;

type Translate = ReturnType< typeof useTranslate >;

export function computeSubmissionIssues(
	values: PodcastFieldValues,
	coverImage: PodcastCoverImage,
	hasPublishedEpisode: boolean | undefined,
	translate: Translate
): string[] {
	const list: string[] = [];
	const podcastingCategoryId = Number( values.podcasting_category_id ?? 0 );
	const isPodcastingEnabled = podcastingCategoryId > 0;

	if ( ! isPodcastingEnabled ) {
		list.push( translate( 'Select a podcast category.' ) as string );
	}
	// Only flag missing episodes once we have a definitive answer; while the
	// query is in flight we leave the issue out so it doesn't flash on load.
	if ( isPodcastingEnabled && hasPublishedEpisode === false ) {
		list.push( translate( 'Publish at least one episode.' ) as string );
	}
	if ( ! String( values.podcasting_title ?? '' ).trim() ) {
		list.push( translate( 'Add a title.' ) as string );
	}
	if ( ! String( values.podcasting_summary ?? '' ).trim() ) {
		list.push( translate( 'Add a summary.' ) as string );
	}
	if ( ! String( values.podcasting_talent_name ?? '' ).trim() ) {
		list.push( translate( 'Add a host, artist, or producer name.' ) as string );
	}
	if ( ! String( values.podcasting_email ?? '' ).trim() ) {
		list.push( translate( 'Add an email address.' ) as string );
	}
	const primaryTopic = String( values.podcasting_category_1 ?? '0' );
	if ( primaryTopic === '0' || primaryTopic === '' ) {
		list.push( translate( 'Choose a primary podcast topic.' ) as string );
	}
	const coverImageId = Number( values.podcasting_image_id ?? 0 ) || 0;
	if ( ! coverImageId ) {
		list.push( translate( 'Add a cover image.' ) as string );
	} else if ( coverImage ) {
		const { width, height, mime_type: mimeType } = coverImage;
		if ( mimeType && mimeType !== 'image/png' && mimeType !== 'image/jpeg' ) {
			list.push( translate( 'Cover image must be a PNG or JPG.' ) as string );
		}
		if ( width && height && width !== height ) {
			list.push( translate( 'Cover image must be square.' ) as string );
		}
		if ( width && ( width < 1400 || width > 3000 ) ) {
			list.push(
				translate( 'Cover image must be between 1400×1400 and 3000×3000 pixels.' ) as string
			);
		}
	}
	return list;
}

type SavedPodcastSettings = PodcastFieldValues & Record< string, unknown >;

/**
 * Reads the saved podcast settings from Redux and returns the same readiness
 * issues that the Settings form computes from its live fields. Use on surfaces
 * (e.g. Distribution) that need to gate behavior on the persisted feed state.
 *
 * Also requests the cover image media item so the dimension/mime checks have
 * data to work with, sparing callers from rendering their own QueryMedia.
 * The Redux media middleware dedupes duplicate in-flight item requests, so it's
 * safe even when another surface (Settings' QueryMedia) requests the same id.
 *
 * `isLoading` lets callers gate UI while saved settings or the episode-presence
 * query haven't resolved — without it, an empty-but-loading state briefly looks
 * like a clean feed and lets users click through gates that haven't computed.
 */
export function useSubmissionIssues(): {
	issues: string[];
	isPodcastingEnabled: boolean;
	isLoading: boolean;
} {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const settings = useSelector( ( state ) =>
		siteId ? ( getSiteSettings( state, siteId ) as SavedPodcastSettings | null ) : null
	);
	const coverImageId = Number( settings?.podcasting_image_id ?? 0 ) || 0;
	const coverImage = useSelector( ( state ) =>
		coverImageId && siteId
			? ( getMediaItem( state, siteId, coverImageId ) as PodcastCoverImage )
			: null
	);
	const podcastingCategoryId = Number( settings?.podcasting_category_id ?? 0 ) || 0;
	const hasPublishedEpisode = useHasPublishedEpisode( siteId, podcastingCategoryId );

	useEffect( () => {
		if ( siteId && coverImageId ) {
			dispatch( requestMediaItem( siteId, coverImageId ) );
		}
	}, [ dispatch, siteId, coverImageId ] );

	return useMemo( () => {
		const values: PodcastFieldValues = settings ?? {};
		const issues = computeSubmissionIssues( values, coverImage, hasPublishedEpisode, translate );
		const isPodcastingEnabled = podcastingCategoryId > 0;
		const isLoading =
			settings === null || ( isPodcastingEnabled && hasPublishedEpisode === undefined );
		return { issues, isPodcastingEnabled, isLoading };
	}, [ settings, coverImage, hasPublishedEpisode, translate, podcastingCategoryId ] );
}
