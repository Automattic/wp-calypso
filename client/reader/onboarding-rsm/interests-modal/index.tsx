import { followReadTagMutation, unfollowReadTagMutation } from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import React, { useState, useEffect, useRef } from 'react';
import { useReaderInterestTags } from 'calypso/data/reader/use-reader-interest-tags';
import {
	getFollowingSource,
	useSiteSubscriptions,
	useFollowSite,
} from 'calypso/reader/data/site-subscriptions';
import { useFollowedTags } from 'calypso/reader/data/tags';
import {
	READER_ONBOARDING_MIN_FOLLOWED_TAGS,
	READER_ONBOARDING_TRACKS_EVENT_PREFIX,
} from 'calypso/reader/onboarding-rsm/constants';
import { StepIndicator } from 'calypso/reader/onboarding-rsm/step-indicator';
import { recordFollow } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import TopicGroupCard from './topic-group-card';
import { getTopicGroups, type TopicGroup } from './topic-groups';
import InterestsVerificationNudge from './verificationNudge';
import type { CuratedBlog } from '../curated-blogs';

import './style.scss';

interface InterestsModalProps {
	onContinue: () => void;
	promptVerification: boolean;
	// Whether the user has performed any subscribe action (individual tag
	// follow or pack subscribe) during the current onboarding session. The
	// parent owns this flag so it persists across remounts of this modal —
	// e.g. user subscribes to a tagless pack, advances to discover, then uses
	// Back; the relaxed Continue gate must still apply on return.
	hasFollowed: boolean;
	onFollowed: () => void;
	// Pre-computed blog map owned by the parent so the random blog selection
	// stays stable when the user navigates away from this step and returns.
	// In production always provided by ReaderOnboardingRsm; optional here
	// only so tests that don't care about packs can skip the boilerplate.
	packBlogsById?: Map< string, CuratedBlog[] >;
	// Tracks which packs have been explicitly subscribed in-session. Owned by
	// the parent so it survives remounts of this component (e.g. user
	// subscribes to a pack, advances to discover, then clicks Back).
	// Optional for the same test-ergonomics reason as packBlogsById.
	relaxedPackCriteria?: Set< string >;
	onPackSubscribed?: ( packId: string ) => void;
}

type ResolvedPack = TopicGroup & { blogs: CuratedBlog[] };
const MAX_INTEREST_TOPICS = 40;

// Renders the body of the "interests" step. The shared <Modal> wrapper is
// provided by the parent (`ReaderOnboardingRsm`); this component is only
// mounted while the step is active. X-out / escape are handled by the
// wrapper's `onRequestClose`.
const InterestsModal: React.FC< InterestsModalProps > = ( {
	onContinue,
	promptVerification,
	hasFollowed,
	onFollowed,
	packBlogsById = new Map(),
	relaxedPackCriteria = new Set(),
	onPackSubscribed = () => {},
} ) => {
	const [ followedTags, setFollowedTags ] = useState< string[] >( [] );
	const [ showAllTopics, setShowAllTopics ] = useState( false );
	const hasSyncedFromServerRef = useRef( false );
	const followedTagsRef = useRef< string[] >( [] );
	const interestTopics = useReaderInterestTags( { enabled: true } ).slice( 0, MAX_INTEREST_TOPICS );
	const { data: followedTagsFromState } = useFollowedTags();
	const { subscriptions } = useSiteSubscriptions();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const [ processingTags, setProcessingTags ] = useState< Set< string > >( new Set() );
	const inFlightTagOpsRef = useRef< Map< string, Promise< boolean > > >( new Map() );
	const [ processingPacks, setProcessingPacks ] = useState< Set< string > >( new Set() );
	const { mutateAsync: followTag } = useMutation( followReadTagMutation( queryClient ) );
	const { mutateAsync: unfollowTag } = useMutation( unfollowReadTagMutation( queryClient ) );
	const followSite = useFollowSite();

	// Sync the user's already-followed tags from server once on mount. The
	// component only mounts while the step is active, so the previous
	// `isOpen`-gated reset effect is no longer needed — the ref is reset
	// implicitly when the component unmounts after the user leaves the step.
	useEffect( () => {
		if ( ! followedTagsFromState || hasSyncedFromServerRef.current ) {
			return;
		}
		if ( inFlightTagOpsRef.current.size > 0 ) {
			return;
		}
		const syncedTags = followedTagsFromState.map( ( tag ) => tag.slug );
		followedTagsRef.current = syncedTags;
		setFollowedTags( syncedTags );
		hasSyncedFromServerRef.current = true;
	}, [ followedTagsFromState ] );

	useEffect( () => {
		followedTagsRef.current = followedTags;
	}, [ followedTags ] );

	const topicGroups = getTopicGroups();

	const packs = topicGroups
		.map( ( group ) => ( {
			...group,
			blogs: packBlogsById.get( group.id ) ?? [],
		} ) )
		// Defensive: hide any pack that resolves to nothing to subscribe to
		// (e.g., a tagless pack id with no curated entry).
		.filter( ( pack ) => pack.tags.length > 0 || pack.blogs.length > 0 );

	const isBlogFollowed = ( blog: CuratedBlog ): boolean =>
		subscriptions.some(
			( subscription ) =>
				( blog.feed_ID && subscription.feed_ID === blog.feed_ID ) ||
				( blog.site_ID && subscription.blog_ID === blog.site_ID )
		);

	const isPackSubscribed = ( pack: ResolvedPack ): boolean => {
		const tagsFollowed = pack.tags.every( ( tag ) => followedTags.includes( tag ) );
		if ( ! tagsFollowed ) {
			return false;
		}

		// Initial render uses strict criteria (all blogs) so existing complete pack
		// follows are recognized precisely. After the user explicitly subscribes to
		// this pack in-session, relax to "at least one blog" to avoid being held
		// hostage by stale/deleted recommended blogs.
		const followedBlogCount = pack.blogs.filter( isBlogFollowed ).length;
		if ( relaxedPackCriteria.has( pack.id ) ) {
			return pack.blogs.length === 0 || followedBlogCount > 0;
		}
		return followedBlogCount === pack.blogs.length;
	};

	const isContinueDisabled =
		followedTags.length < READER_ONBOARDING_MIN_FOLLOWED_TAGS && ! hasFollowed;

	const handleTopicChange = async ( checked: boolean, tag: string ): Promise< boolean > => {
		const existingOperation = inFlightTagOpsRef.current.get( tag );
		if ( existingOperation ) {
			return existingOperation;
		}

		const operation = ( async (): Promise< boolean > => {
			if ( checked ) {
				onFollowed();
			}

			// Mark the tag as being processed.
			setProcessingTags( ( current ) => new Set( current ).add( tag ) );

			// Follow or unfollow the tag and update the followed tags state for the UI.
			const currentTags = followedTagsRef.current;
			let nextTags = currentTags.filter( ( t ) => t !== tag );
			if ( checked ) {
				nextTags = currentTags.includes( tag ) ? currentTags : [ ...currentTags, tag ];
			}
			followedTagsRef.current = nextTags;
			setFollowedTags( nextTags );

			dispatch(
				recordReaderTracksEvent(
					checked ? 'calypso_reader_reader_tag_followed' : 'calypso_reader_reader_tag_unfollowed',
					{
						tag,
						follow_source: 'reader-onboarding-modal',
						total_followed: nextTags.length,
					}
				)
			);

			try {
				await ( checked ? followTag( tag ) : unfollowTag( tag ) );
				return true;
			} catch {
				// Revert the optimistic update when the request fails.
				const rollbackBaseTags = followedTagsRef.current;
				let rollbackTags = rollbackBaseTags;
				if ( checked ) {
					rollbackTags = rollbackBaseTags.filter( ( t ) => t !== tag );
				} else if ( ! rollbackBaseTags.includes( tag ) ) {
					rollbackTags = [ ...rollbackBaseTags, tag ];
				}
				followedTagsRef.current = rollbackTags;
				setFollowedTags( rollbackTags );
				const errorMessage = checked
					? translate( 'Could not follow tag: %(tag)s', { args: { tag } } )
					: translate( 'Could not unfollow tag: %(tag)s', { args: { tag } } );
				dispatch( errorNotice( errorMessage ) );
				return false;
			} finally {
				setProcessingTags( ( current ) => {
					const updated = new Set( current );
					updated.delete( tag );
					return updated;
				} );
			}
		} )();

		inFlightTagOpsRef.current.set( tag, operation );

		try {
			return await operation;
		} finally {
			inFlightTagOpsRef.current.delete( tag );
		}
	};

	const handlePackSubscribe = async ( pack: ResolvedPack ) => {
		if ( processingPacks.has( pack.id ) || isPackSubscribed( pack ) ) {
			return;
		}

		setProcessingPacks( ( current ) => new Set( current ).add( pack.id ) );
		onFollowed();
		try {
			// Follow tags in deterministic order so state updates don't race each other.
			for ( const tag of pack.tags ) {
				while ( true ) {
					const inFlight = inFlightTagOpsRef.current.get( tag );
					if ( inFlight ) {
						await inFlight;
					} else {
						break;
					}
				}

				if ( followedTagsRef.current.includes( tag ) ) {
					continue;
				}

				const didFollowTag = await handleTopicChange( true, tag );
				if ( ! didFollowTag ) {
					return;
				}
			}

			onPackSubscribed( pack.id );

			recordTracksEvent(
				`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_pack_subscribed`,
				{
					pack_id: pack.id,
					tag_count: pack.tags.length,
					blog_count: pack.blogs.length,
				}
			);

			// Follow any blogs in the pack we're not already following.
			for ( const blog of pack.blogs ) {
				if ( isBlogFollowed( blog ) ) {
					continue;
				}
				// Best effort only: site-specific failures are handled by existing
				// follow notices and should not block pack completion.
				followSite.mutate( {
					feedUrl: blog.feed_URL,
					source: getFollowingSource(),
				} );
				// Mirror how the rest of Reader tracks site follows so pack-blog
				// follows show up under the standard `calypso_reader_site_followed`
				// event with a `reader-onboarding-modal` follow source.
				recordFollow( blog.feed_URL, undefined, {
					follow_source: 'reader-onboarding-modal',
				} );
			}
		} finally {
			setProcessingPacks( ( current ) => {
				const updated = new Set( current );
				updated.delete( pack.id );
				return updated;
			} );
		}
	};

	const handleContinue = () => {
		if ( ! isContinueDisabled ) {
			onContinue();
		}
	};

	const handleToggleTopics = () => {
		const next = ! showAllTopics;
		setShowAllTopics( next );
		recordTracksEvent(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_individual_topics_toggled`,
			{ expanded: next }
		);
	};

	return (
		<>
			{ promptVerification && <InterestsVerificationNudge /> }
			<VStack spacing={ 4 } className="interests-modal__content">
				<VStack spacing={ 0 }>
					<h2 className="interests-modal__title">{ __( 'What topics interest you?' ) }</h2>
					<p className="interests-modal__subtitle">
						<span>
							{ __(
								'​​Stay up-to-date with your favorite blogs and discover new voices—all from one place.'
							) }
						</span>
						<br className="interests-modal__subtitle-break" />{ ' ' }
						<span>
							{ __( 'Pick a pack that describes your interest, or switch to individual topics.' ) }
						</span>
					</p>
				</VStack>

				{ packs.length > 0 && (
					<div className="interests-modal__packs" role="list">
						{ packs.map( ( pack ) => (
							<div className="interests-modal__pack-item" role="listitem" key={ pack.id }>
								<TopicGroupCard
									title={ pack.title }
									imageUrl={ pack.imageUrl }
									description={ pack.description }
									tags={ pack.tags }
									blogs={ pack.blogs }
									isSubscribed={ isPackSubscribed( pack ) }
									isBusy={ processingPacks.has( pack.id ) }
									onSubscribe={ () => void handlePackSubscribe( pack ) }
								/>
							</div>
						) ) }
					</div>
				) }

				{ interestTopics.length > 0 && (
					<div className="interests-modal__topics-toggle-row">
						<Button
							variant="link"
							onClick={ handleToggleTopics }
							className="interests-modal__topics-toggle"
							aria-expanded={ showAllTopics }
						>
							{ showAllTopics ? __( 'See less topics' ) : __( 'See more topics' ) }
						</Button>
					</div>
				) }

				{ showAllTopics && (
					<div className="interests-modal__topics-pills" role="group" aria-label={ __( 'Topics' ) }>
						{ interestTopics.map( ( topic ) => {
							const checked = followedTags.includes( topic.tag );
							return (
								<button
									key={ topic.tag }
									type="button"
									className={ clsx( 'interests-modal__topic-pill', {
										'is-selected': checked,
									} ) }
									aria-pressed={ checked }
									disabled={ processingTags.has( topic.tag ) }
									onClick={ () => void handleTopicChange( ! checked, topic.tag ) }
								>
									{ topic.name }
								</button>
							);
						} ) }
					</div>
				) }
			</VStack>

			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<StepIndicator totalSteps={ 3 } currentStep={ 2 } />
					<HStack spacing={ 2 } justify="right" className="reader-onboarding-modal__footer-buttons">
						<Button
							__next40pxDefaultSize
							onClick={ handleContinue }
							variant="secondary"
							disabled={ isContinueDisabled || promptVerification }
							accessibleWhenDisabled
						>
							{ __( 'Continue' ) }
						</Button>
					</HStack>
				</HStack>
			</div>
		</>
	);
};

export default InterestsModal;
