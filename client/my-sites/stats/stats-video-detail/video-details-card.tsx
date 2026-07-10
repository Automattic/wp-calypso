import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

export interface VideoMediaItem {
	ID: number;
	title?: string;
	date?: string;
	/** Video duration in seconds. */
	length?: number;
	thumbnails?: Record< string, string >;
}

/** Attachment post info from the stats/video endpoint response. */
export interface VideoStatsPost {
	title?: string;
	date?: string;
}

const THUMBNAIL_SIZES = [ 'fmt_hd', 'fmt_dvd', 'fmt_std' ];

export default function VideoDetailsCard( {
	media,
	statsPost,
	mediaId,
}: {
	media: VideoMediaItem | null;
	statsPost: VideoStatsPost | null;
	mediaId: number;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const adminBaseUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const title = media?.title ?? statsPost?.title;
	const date = media?.date ?? statsPost?.date;

	const isLoading = ! media && ! statsPost;
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isOdyssey = config.isEnabled( 'is_odyssey' );

	// In Odyssey the media item is never fetched (the stats-app proxy has no
	// media route yet), so hide the card until the stats/video response
	// provides the post fallback instead of shimmering indefinitely.
	if ( isOdysseyStats && isLoading ) {
		return null;
	}

	const mediaLibraryUrl = isOdyssey
		? adminBaseUrl && `${ adminBaseUrl }upload.php?item=${ mediaId }`
		: siteSlug && `/media/${ siteSlug }/${ mediaId }`;

	const thumbnailSize = THUMBNAIL_SIZES.find( ( size ) => media?.thumbnails?.[ size ] );
	const thumbnailUrl = thumbnailSize && media?.thumbnails?.[ thumbnailSize ];

	const classes = isLoading ? 'stats-video-details-card is-loading' : 'stats-video-details-card';

	return (
		<Card className={ classes }>
			<h4 className="stats-video-details-card__heading">{ translate( 'Video details' ) }</h4>
			<div className="stats-video-details-card__info">
				<div className="stats-video-details-card__title">{ title }</div>
				{ ( isLoading || date ) && (
					<div className="stats-video-details-card__date">
						{ date &&
							translate( 'Published %(date)s', {
								args: { date: moment( date ).format( 'll' ) },
								comment: 'Date when the video was uploaded.',
							} ) }
					</div>
				) }
			</div>
			{ thumbnailUrl && (
				<a
					className="stats-video-details-card__thumbnail-link"
					href={ mediaLibraryUrl || undefined }
					title={ translate( 'View in Media Library', { textOnly: true } ) }
				>
					<img
						className="stats-video-details-card__thumbnail"
						src={ thumbnailUrl }
						alt={ translate( 'Thumbnail for a video titled "%(title)s"', {
							args: { title: title ?? '' },
							comment: 'Alt-text for a video thumbnail.',
							textOnly: true,
						} ) }
					/>
				</a>
			) }
		</Card>
	);
}
