import { readFeedQuery } from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useFollowSite, useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { READER_FOLLOW_SITES_PACK } from 'calypso/reader/follow-sources';
import { getPackBlogs } from 'calypso/reader/onboarding-rsm/interests-modal/get-pack-blogs';
import {
	getTopicGroups,
	type TopicGroup,
} from 'calypso/reader/onboarding-rsm/interests-modal/topic-groups';
import { recordFollow } from 'calypso/reader/stats';
import type { CuratedBlog } from 'calypso/reader/onboarding-rsm/curated-blogs';
import type { JSX } from 'react';

const BLOGS_PER_PACK = 8;
const MAX_VISIBLE_AVATARS = 4;
const AVATAR_SIZE = 26;

export type StarterPack = TopicGroup & { blogs: CuratedBlog[] };

export function buildStarterPacks( random: () => number = Math.random ): StarterPack[] {
	return getTopicGroups()
		.map( ( group ) => ( {
			...group,
			blogs: getPackBlogs( group.tags, {
				count: BLOGS_PER_PACK,
				random,
				directKey: group.tags.length === 0 ? group.id : undefined,
			} ),
		} ) )
		.filter( ( pack ) => pack.blogs.length > 0 );
}

function BlogAvatar( { blog }: { blog: CuratedBlog } ): JSX.Element {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const feedQuery = readFeedQuery( blog.feed_ID );
	const { data: feed } = useQuery( {
		...feedQuery,
		enabled: Boolean( feedQuery.enabled ) && inView,
	} );

	return (
		<span ref={ ref } className="follow-sites__pack-avatar" title={ blog.site_name }>
			<SiteIcon iconUrl={ feed?.image } size={ AVATAR_SIZE } alt={ blog.site_name } lazy />
		</span>
	);
}

interface StarterPackCardProps {
	pack: StarterPack;
	isFollowed: boolean;
	isBusy: boolean;
	onFollowAll: ( pack: StarterPack ) => void;
}

function StarterPackCard( {
	pack,
	isFollowed,
	isBusy,
	onFollowAll,
}: StarterPackCardProps ): JSX.Element {
	const translate = useTranslate();
	const blogCount = translate( '%(count)d blog', '%(count)d blogs', {
		count: pack.blogs.length,
		args: { count: pack.blogs.length },
	} );

	let label = translate( 'Follow all' );
	if ( isBusy ) {
		label = translate( 'Following…' );
	} else if ( isFollowed ) {
		label = translate( 'Following' );
	}

	return (
		<article
			className={ clsx( 'follow-sites__pack', { 'is-followed': isFollowed } ) }
			aria-label={ pack.title }
		>
			<div>
				<h3 className="follow-sites__pack-name">{ pack.title }</h3>
				<p className="follow-sites__pack-count">{ blogCount }</p>
			</div>
			<div className="follow-sites__pack-footer">
				<div className="follow-sites__pack-avatars" aria-hidden>
					{ pack.blogs.slice( 0, MAX_VISIBLE_AVATARS ).map( ( blog ) => (
						<BlogAvatar key={ blog.feed_ID } blog={ blog } />
					) ) }
				</div>
				<Button
					variant={ isFollowed ? 'secondary' : 'primary' }
					size="compact"
					isBusy={ isBusy }
					disabled={ isFollowed || isBusy }
					accessibleWhenDisabled
					aria-label={ String(
						translate( 'Follow all sites in %(pack)s', { args: { pack: pack.title } } )
					) }
					onClick={ () => onFollowAll( pack ) }
				>
					{ isFollowed && <Icon icon={ check } size={ 18 } /> }
					{ label }
				</Button>
			</div>
		</article>
	);
}

export default function StarterPacks(): JSX.Element {
	const translate = useTranslate();
	const [ packs ] = useState( () => buildStarterPacks() );
	const { subscriptions } = useSiteSubscriptions();
	const followSite = useFollowSite();
	const [ busyPackIds, setBusyPackIds ] = useState< Set< string > >( () => new Set() );

	const isBlogFollowed = useCallback(
		( blog: CuratedBlog ) =>
			subscriptions.some(
				( subscription ) =>
					( blog.feed_ID && Number( subscription.feed_ID ) === blog.feed_ID ) ||
					( blog.site_ID && Number( subscription.blog_ID ) === blog.site_ID )
			),
		[ subscriptions ]
	);

	const followedPackIds = useMemo(
		() =>
			new Set(
				packs.filter( ( pack ) => pack.blogs.every( isBlogFollowed ) ).map( ( p ) => p.id )
			),
		[ packs, isBlogFollowed ]
	);

	const handleFollowAll = async ( pack: StarterPack ) => {
		if ( busyPackIds.has( pack.id ) || followedPackIds.has( pack.id ) ) {
			return;
		}
		setBusyPackIds( ( current ) => new Set( current ).add( pack.id ) );

		const blogsToFollow = pack.blogs.filter( ( blog ) => ! isBlogFollowed( blog ) );
		recordTracksEvent( 'calypso_reader_follow_sites_pack_followed', {
			pack_id: pack.id,
			blog_count: blogsToFollow.length,
		} );

		try {
			await Promise.allSettled(
				blogsToFollow.map( ( blog ) => {
					recordFollow( blog.feed_URL, undefined, { follow_source: READER_FOLLOW_SITES_PACK } );
					return followSite.mutateAsync( {
						feedUrl: blog.feed_URL,
						source: READER_FOLLOW_SITES_PACK,
					} );
				} )
			);
		} finally {
			setBusyPackIds( ( current ) => {
				const next = new Set( current );
				next.delete( pack.id );
				return next;
			} );
		}
	};

	if ( packs.length === 0 ) {
		return <></>;
	}

	return (
		<section className="follow-sites__section">
			<h2 className="follow-sites__section-title">{ translate( 'Starter packs' ) }</h2>
			<div className="follow-sites__packs">
				{ packs.map( ( pack ) => (
					<StarterPackCard
						key={ pack.id }
						pack={ pack }
						isFollowed={ followedPackIds.has( pack.id ) }
						isBusy={ busyPackIds.has( pack.id ) }
						onFollowAll={ handleFollowAll }
					/>
				) ) }
			</div>
		</section>
	);
}
