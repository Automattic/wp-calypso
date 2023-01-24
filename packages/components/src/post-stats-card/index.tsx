import { eye } from '@automattic/components/src/icons';
import { Icon, commentContent, starEmpty } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Card, ShortenedNumber } from '../';
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
						<ShortenedNumber value={ viewCount } />
					</div>
				</div>
				<div className="post-stats-card__count post-stats-card__count--like">
					<Icon className="gridicon" icon={ starEmpty } />
					<div className="post-stats-card__count-header">{ translate( 'Likes' ) }</div>
					<div className="post-stats-card__count-value">
						<ShortenedNumber value={ likeCount } />
					</div>
				</div>
				<div className="post-stats-card__count post-stats-card__count--comment">
					<Icon className="gridicon" icon={ commentContent } />
					<div className="post-stats-card__count-header">{ translate( 'Comments' ) }</div>
					<div className="post-stats-card__count-value">
						<ShortenedNumber value={ commentCount } />
					</div>
				</div>
			</div>
			{ post?.post_thumbnail && (
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
