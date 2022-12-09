import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Card } from '../';
import './style.scss';

type PostStatsCardProps = {
	commentCount: number | null;
	heading: React.ReactNode;
	likeCount: number | null;
	viewCount: number | null;
	post: {
		date: string;
		post_thumbnail: string | null;
		title: string;
	};
};

export default function PostStatsCard( {
	commentCount,
	heading,
	likeCount,
	post,
	viewCount,
}: PostStatsCardProps ) {
	const translate = useTranslate();
	const parsedDate = useMemo( () => new Date( post?.date ).toLocaleDateString(), [ post?.date ] );
	return (
		<Card className="post-stats-card">
			<div className="post-stats-card__heading">{ heading }</div>
			<div className="post-stats-card__post-info">
				<div className="post-stats-card__post-title">{ post?.title }</div>
				{ post?.date && (
					<div className="post-stats-card__post-date">
						{ translate( 'Published %(date)s', {
							// TODO: Show relative duration instead of published date
							args: { date: parsedDate },
						} ) }
					</div>
				) }
			</div>
			<div className="post-stats-card__counts">
				<div className="post-stats-card__view-count">
					<div className="post-stats-card__count-header">Views</div>
					{ /* TODO: Use shortened numbers */ }
					<div className="post-stats-card__count-value">{ viewCount }</div>
				</div>
				<div className="post-stats-card__like-count">
					<div className="post-stats-card__count-header">Likes</div>
					{ /* TODO: Use shortened numbers */ }
					<div className="post-stats-card__count-value">{ likeCount }</div>
				</div>
				<div className="post-stats-card__comment-count">
					<div className="post-stats-card__count-header">Comments</div>
					{ /* TODO: Use shortened numbers */ }
					<div className="post-stats-card__count-value">{ commentCount }</div>
				</div>
			</div>
			{ post?.post_thumbnail && (
				<img
					className="post-stats-card__thumbnail"
					src={ post?.post_thumbnail }
					alt={ translate( 'Thumbnail for the post' ) }
				/>
			) }
		</Card>
	);
}
