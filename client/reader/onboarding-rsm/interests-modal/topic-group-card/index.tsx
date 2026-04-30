import { readFeedQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, sprintf, _n } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { SiteIcon } from 'calypso/blocks/site-icon';
import type { CuratedBlog } from '../../curated-blogs';

import './style.scss';

const MAX_VISIBLE_AVATARS = 3;
const AVATAR_SIZE = 28;

type TopicGroupCardProps = {
	title: string;
	imageUrl: string;
	description: string;
	tags: string[];
	blogs: CuratedBlog[];
	isSubscribed: boolean;
	isBusy?: boolean;
	onSubscribe: () => void;
};

const BlogAvatar: React.FC< { blog: CuratedBlog } > = ( { blog } ) => {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const feedQuery = readFeedQuery( blog.feed_ID );
	const { data: feed } = useQuery( {
		...feedQuery,
		enabled: Boolean( feedQuery.enabled ) && inView,
	} );
	const iconUrl = feed?.image;

	return (
		<>
			<span
				ref={ ref }
				className="topic-group-card__avatar"
				title={ blog.site_name }
				style={ { width: AVATAR_SIZE, height: AVATAR_SIZE } }
			>
				<SiteIcon iconUrl={ iconUrl } size={ AVATAR_SIZE } alt={ blog.site_name } lazy />
			</span>
		</>
	);
};

const TopicGroupCard: React.FC< TopicGroupCardProps > = ( {
	title,
	imageUrl,
	description,
	tags,
	blogs,
	isSubscribed,
	isBusy = false,
	onSubscribe,
} ) => {
	const visibleBlogs = blogs.slice( 0, MAX_VISIBLE_AVATARS );
	const remainingCount = Math.max( 0, blogs.length - MAX_VISIBLE_AVATARS );

	const tagCount = tags.length;
	const tagSummary = tagCount
		? sprintf(
				/* translators: %d is a number of topics. */
				_n( '%d topic', '%d topics', tagCount ),
				tagCount
		  )
		: '';
	const blogSummary = blogs.length
		? sprintf(
				/* translators: %d is a number of blogs. */
				_n( '%d blog', '%d blogs', blogs.length ),
				blogs.length
		  )
		: '';
	const meta = [ tagSummary, blogSummary ].filter( Boolean ).join( ' · ' );
	let subscribeLabel = __( 'Subscribe' );
	let subscribeAriaLabel = sprintf(
		/* translators: %s is the topic pack title. */
		__( 'Subscribe to %s' ),
		title
	);
	if ( isBusy ) {
		subscribeLabel = __( 'Subscribing' );
		subscribeAriaLabel = sprintf(
			/* translators: %s is the topic pack title. */
			__( 'Subscribing to %s' ),
			title
		);
	}
	if ( isSubscribed ) {
		subscribeLabel = __( 'Subscribed' );
		subscribeAriaLabel = sprintf(
			/* translators: %s is the topic pack title. */
			__( 'Subscribed to %s' ),
			title
		);
	}

	return (
		<article
			className={ clsx( 'topic-group-card', { 'is-subscribed': isSubscribed } ) }
			aria-label={ title }
		>
			<header className="topic-group-card__header">
				<h3 className="topic-group-card__title">{ title }</h3>
				{ meta && <p className="topic-group-card__meta">{ meta }</p> }
			</header>
			{ imageUrl && (
				<div className="topic-group-card__image-wrap">
					<img className="topic-group-card__image" src={ imageUrl } alt="" aria-hidden />
				</div>
			) }
			<p className="topic-group-card__description">{ description }</p>
			{ blogs.length > 0 && (
				<div className="topic-group-card__avatars" aria-hidden>
					{ visibleBlogs.map( ( blog ) => (
						<BlogAvatar key={ blog.feed_ID } blog={ blog } />
					) ) }
					{ remainingCount > 0 && (
						<span
							className="topic-group-card__avatar topic-group-card__avatar-more"
							style={ { width: AVATAR_SIZE, height: AVATAR_SIZE } }
						>
							+{ remainingCount }
						</span>
					) }
				</div>
			) }
			<Button
				__next40pxDefaultSize
				className={ clsx( 'topic-group-card__subscribe', {
					'is-subscribed': isSubscribed,
					'is-busy': isBusy,
				} ) }
				variant="primary"
				onClick={ onSubscribe }
				isBusy={ isBusy }
				disabled={ isSubscribed || isBusy }
				accessibleWhenDisabled
				aria-label={ subscribeAriaLabel }
			>
				{ isSubscribed && (
					<Icon className="topic-group-card__subscribe-icon" icon={ check } size={ 18 } />
				) }
				<span className="topic-group-card__subscribe-label">{ subscribeLabel }</span>
			</Button>
		</article>
	);
};

export default TopicGroupCard;
