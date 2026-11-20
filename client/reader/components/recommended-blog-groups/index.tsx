import { Button, Popover } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, check, info, plus } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useId, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	useFollowSite,
	useIsSubscribed,
	useUnfollowSite,
} from 'calypso/reader/data/site-subscriptions';
import { useLatestPostDate } from 'calypso/reader/onboarding-rsm/recommended-blogs/use-latest-post-date';
import type {
	RecommendedBlog,
	RecommendedBlogGroup,
} from 'calypso/reader/onboarding-rsm/recommended-blogs';

import './style.scss';

type SelectModeProps = {
	mode: 'select';
	selectedFeedIds: ReadonlySet< number >;
	onToggle: ( blog: RecommendedBlog ) => void;
	onBlogHidden?: ( blog: RecommendedBlog ) => void;
	disabled?: boolean;
};

type FollowModeProps = {
	mode: 'follow';
	followSource?: string;
};

type RecommendedBlogGroupsProps = {
	groups: RecommendedBlogGroup[];
	headingLevel?: 2 | 3;
} & ( SelectModeProps | FollowModeProps );

const getDomain = ( url: string ) => {
	try {
		return new URL( url ).hostname.replace( /^www\./, '' );
	} catch {
		return url;
	}
};

function BlogDetails( { blog, id }: { blog: RecommendedBlog; id: string } ) {
	const moment = useLocalizedMoment();
	const latestPostDate = useLatestPostDate( blog );

	return (
		<div id={ id } className="recommended-blog-groups__details">
			<p className="recommended-blog-groups__details-name">{ blog.name }</p>
			<p className="recommended-blog-groups__details-domain">{ getDomain( blog.site_URL ) }</p>
			<p className="recommended-blog-groups__details-description">{ blog.description }</p>
			{ latestPostDate && (
				<p className="recommended-blog-groups__details-date">
					{ sprintf(
						/* translators: %s is a date, e.g. "Nov 18, 2026". */
						__( 'Latest post: %s' ),
						moment( latestPostDate ).format( 'll' )
					) }
				</p>
			) }
		</div>
	);
}

type BlogPillProps = {
	blog: RecommendedBlog;
	isSelected: boolean;
	isBusy?: boolean;
	isDisabled?: boolean;
	statusText?: string;
	onClick: () => void;
	onIconError: () => void;
};

function BlogPill( {
	blog,
	isSelected,
	isBusy,
	isDisabled,
	statusText,
	onClick,
	onIconError,
}: BlogPillProps ) {
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const detailsId = useId();

	const open = useCallback( () => setIsOpen( true ), [] );
	const close = useCallback( () => setIsOpen( false ), [] );

	return (
		<li
			ref={ setAnchor }
			className={ clsx( 'recommended-blog-groups__pill', { 'is-selected': isSelected } ) }
			onMouseEnter={ open }
			onMouseLeave={ close }
		>
			<button
				type="button"
				className="recommended-blog-groups__pill-toggle"
				aria-pressed={ isSelected }
				aria-describedby={ isOpen ? detailsId : undefined }
				aria-busy={ isBusy || undefined }
				aria-disabled={ isDisabled || isBusy || undefined }
				onClick={ isDisabled || isBusy ? undefined : onClick }
				onFocus={ open }
				onBlur={ close }
				onKeyDown={ ( event ) => {
					if ( event.key === 'Escape' && isOpen ) {
						event.stopPropagation();
						close();
					}
				} }
			>
				<img
					className="recommended-blog-groups__pill-icon"
					src={ blog.icon_URL }
					alt=""
					width={ 24 }
					height={ 24 }
					onError={ onIconError }
				/>
				<span className="recommended-blog-groups__pill-name">{ blog.name }</span>
				{ statusText && <span className="screen-reader-text">{ statusText }</span> }
				<Icon
					className="recommended-blog-groups__pill-mark"
					icon={ isSelected ? check : plus }
					size={ 18 }
				/>
			</button>
			<Button
				__next40pxDefaultSize
				className="recommended-blog-groups__pill-info"
				icon={ info }
				size="small"
				tabIndex={ -1 }
				label={ sprintf(
					/* translators: %s is a blog name. */
					__( 'About %s' ),
					blog.name
				) }
				showTooltip={ false }
				onClick={ open }
			/>
			{ isOpen && anchor && (
				<Popover
					anchor={ anchor }
					placement="bottom-start"
					focusOnMount={ false }
					onClose={ close }
					className="recommended-blog-groups__popover"
				>
					<BlogDetails blog={ blog } id={ detailsId } />
				</Popover>
			) }
		</li>
	);
}

function SelectablePill( {
	blog,
	selectedFeedIds,
	onToggle,
	disabled,
	onIconError,
}: {
	blog: RecommendedBlog;
	onIconError: () => void;
} & Omit< SelectModeProps, 'mode' | 'onBlogHidden' > ) {
	const isFollowing = useIsSubscribed( { feedId: blog.feed_ID, feedUrl: blog.feed_URL } );
	const isSelected = isFollowing || selectedFeedIds.has( blog.feed_ID );

	return (
		<BlogPill
			blog={ blog }
			isSelected={ isSelected }
			isDisabled={ isFollowing || disabled }
			statusText={ isFollowing ? __( 'Already subscribed' ) : undefined }
			onClick={ () => onToggle( blog ) }
			onIconError={ onIconError }
		/>
	);
}

function FollowablePill( {
	blog,
	followSource,
	onIconError,
}: {
	blog: RecommendedBlog;
	followSource?: string;
	onIconError: () => void;
} ) {
	const isFollowing = useIsSubscribed( { feedId: blog.feed_ID, feedUrl: blog.feed_URL } );
	const follow = useFollowSite();
	const unfollow = useUnfollowSite();
	const isBusy = follow.isPending || unfollow.isPending;

	return (
		<BlogPill
			blog={ blog }
			isSelected={ isFollowing }
			isBusy={ isBusy }
			onClick={ () => {
				const params = { feedUrl: blog.feed_URL, source: followSource };
				if ( isFollowing ) {
					unfollow.mutate( params );
				} else {
					follow.mutate( params );
				}
			} }
			onIconError={ onIconError }
		/>
	);
}

/**
 * Recommended blogs as small selectable pills, grouped by interest. Each pill
 * shows the blog's real icon; a blog whose icon fails to load is hidden rather
 * than shown with a placeholder.
 *
 * In `select` mode the parent owns the selection (e.g. to follow in a batch);
 * in `follow` mode each pill follows or unfollows straight away.
 */
export function RecommendedBlogGroups( props: RecommendedBlogGroupsProps ) {
	const { groups, headingLevel = 3 } = props;
	const [ brokenIcons, setBrokenIcons ] = useState< ReadonlySet< number > >( () => new Set() );
	const Heading = headingLevel === 2 ? 'h2' : 'h3';

	const onBlogHidden = props.mode === 'select' ? props.onBlogHidden : undefined;
	const hideBlog = useCallback(
		( blog: RecommendedBlog ) => {
			setBrokenIcons( ( previous ) => new Set( previous ).add( blog.feed_ID ) );
			onBlogHidden?.( blog );
		},
		[ onBlogHidden ]
	);

	return (
		<div className="recommended-blog-groups">
			{ groups.map( ( group ) => {
				const blogs = group.blogs.filter( ( blog ) => ! brokenIcons.has( blog.feed_ID ) );
				if ( blogs.length === 0 ) {
					return null;
				}
				return (
					<section
						key={ group.key }
						className="recommended-blog-groups__group"
						aria-label={ group.title }
					>
						<Heading className="recommended-blog-groups__title">{ group.title }</Heading>
						<ul className="recommended-blog-groups__pills">
							{ blogs.map( ( blog ) =>
								props.mode === 'select' ? (
									<SelectablePill
										key={ blog.feed_ID }
										blog={ blog }
										selectedFeedIds={ props.selectedFeedIds }
										onToggle={ props.onToggle }
										disabled={ props.disabled }
										onIconError={ () => hideBlog( blog ) }
									/>
								) : (
									<FollowablePill
										key={ blog.feed_ID }
										blog={ blog }
										followSource={ props.followSource }
										onIconError={ () => hideBlog( blog ) }
									/>
								)
							) }
						</ul>
					</section>
				);
			} ) }
		</div>
	);
}
