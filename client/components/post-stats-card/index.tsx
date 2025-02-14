import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Card, Button } from '@automattic/components';
import { eye } from '@automattic/components/src/icons';
import { Icon, commentContent, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate, numberFormatCompact } from 'i18n-calypso';
import { useMemo } from 'react';
import './style.scss';

type PostStatsCardProps = {
	commentCount: number | null;
	heading: React.ReactNode;
	likeCount: number | null;
	viewCount: number | null;
	post: {
		date: string | null;
		post_thumbnail: string | null;
		title: string;
	};
	titleLink?: string | undefined;
	uploadHref?: string | undefined;
	locale?: string | undefined;
	isLoading?: boolean | undefined;
};

export default function PostStatsCard( {
	commentCount,
	heading,
	likeCount,
	post,
	viewCount,
	titleLink,
	uploadHref,
	locale,
	isLoading,
}: PostStatsCardProps ) {
	const translate = useTranslate();
	const parsedDate = useMemo(
		() =>
			post?.date
				? new Date( post?.date ).toLocaleDateString( locale, { dateStyle: 'medium' } )
				: '',
		[ post?.date, locale ]
	);
	const TitleTag = titleLink ? 'a' : 'div';

	const recordClickOnUploadImageButton = () => {
		recordTracksEvent( 'calypso_stats_insights_upload_image_button_click', { href: uploadHref } );

		if ( uploadHref ) {
			window.location.href = uploadHref;
		}
	};

	const classes = clsx( 'post-stats-card', {
		'is-loading': isLoading,
	} );

	return (
		<Card className={ classes }>
			<h4 className="post-stats-card__heading">{ heading }</h4>
			<div className="post-stats-card__post-info">
				<TitleTag className="post-stats-card__post-title" href={ titleLink } target="_blank">
					{ post?.title }
				</TitleTag>
				{ ( isLoading || post?.date ) && (
					<div className="post-stats-card__post-date">
						{ translate( 'Published %(date)s', {
							// TODO: Show relative duration instead of published date. Show actual date in a tooltip.
							args: { date: parsedDate },
							comment: 'Date when the post was published.',
						} ) }
					</div>
				) }
			</div>
			<div className="post-stats-card__counts">
				<div className="post-stats-card__count post-stats-card__count--view">
					<Icon className="gridicon" icon={ eye } />
					<div className="post-stats-card__count-header">{ translate( 'Views' ) }</div>
					<div className="post-stats-card__count-value">
						<span>
							{ ! isLoading && viewCount !== null ? numberFormatCompact( viewCount ) : '-' }
						</span>
					</div>
				</div>
				<div className="post-stats-card__count post-stats-card__count--like">
					<Icon className="gridicon" icon={ starEmpty } />
					<div className="post-stats-card__count-header">{ translate( 'Likes' ) }</div>
					<div className="post-stats-card__count-value">
						<span>
							{ ! isLoading && likeCount !== null ? numberFormatCompact( likeCount ) : '-' }
						</span>
					</div>
				</div>
				<div className="post-stats-card__count post-stats-card__count--comment">
					<Icon className="gridicon" icon={ commentContent } />
					<div className="post-stats-card__count-header">{ translate( 'Comments' ) }</div>
					<div className="post-stats-card__count-value">
						<span>
							{ ! isLoading && commentCount !== null ? numberFormatCompact( commentCount ) : '-' }
						</span>
					</div>
				</div>
			</div>
			{ ( isLoading || ( ! post?.post_thumbnail && uploadHref ) ) && (
				<div className="post-stats-card__upload">
					<Button
						className="post-stats-card__upload-btn is-compact"
						onClick={ recordClickOnUploadImageButton }
					>
						{ translate( 'Add featured image' ) }
					</Button>
				</div>
			) }
			{ ! isLoading && post?.post_thumbnail && (
				<img
					className="post-stats-card__thumbnail"
					src={ post?.post_thumbnail }
					alt={ translate( 'Thumbnail for a post titled "%(title)s"', {
						args: { title: post.title },
						comment: 'Alt-text for a thumbnail picture for a given post.',
						textOnly: true,
					} ) }
				/>
			) }
		</Card>
	);
}
