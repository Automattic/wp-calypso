import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { fixMe } from 'i18n-calypso';
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from 'react-redux';
import { READER_ONBOARDING_TRACKS_EVENT_PREFIX } from 'calypso/reader/onboarding-rsm/constants';
import { StepIndicator } from 'calypso/reader/onboarding-rsm/step-indicator';
import { useSelector, useDispatch } from 'calypso/state';
import { follow } from 'calypso/state/reader/follows/actions';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import { requestFollowTag, requestUnfollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import { getPackBlogs } from './get-pack-blogs';
import TopicGroupCard from './topic-group-card';
import { getTopicGroups, type TopicGroup } from './topic-groups';
import type { CuratedBlog } from '../curated-blogs';

import './style.scss';

interface InterestsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onContinue: () => void;
}

interface Topic {
	name: string;
	tag: string;
}

interface Category {
	name: string;
	topics: Topic[];
}

interface Tag {
	slug: string;
}

type ResolvedPack = TopicGroup & { blogs: CuratedBlog[] };

const InterestsModal: React.FC< InterestsModalProps > = ( { isOpen, onClose, onContinue } ) => {
	const [ followedTags, setFollowedTags ] = useState< string[] >( [] );
	const [ showAllTopics, setShowAllTopics ] = useState( false );
	const [ busyPacks, setBusyPacks ] = useState< Set< string > >( new Set() );
	const followedTagsFromState = useSelector( getReaderFollowedTags );
	const reduxFollows = useSelector( getReaderFollows );
	const dispatch = useDispatch();
	const [ processingTags, setProcessingTags ] = useState< Set< string > >( new Set() );
	const reduxStore = useStore();

	useEffect( () => {
		// If there are followed tags in the state and no tags are being processed, update the followed tags state for the UI.
		if ( followedTagsFromState && processingTags.size === 0 ) {
			const initialTags = followedTagsFromState.map( ( tag: Tag ) => tag.slug );
			setFollowedTags( initialTags );
		}
	}, [ followedTagsFromState, processingTags ] );

	// Resolve each topic group's blog list once per modal session. The random
	// selection is therefore stable for the lifetime of the modal, which is
	// important because subscribed-status is checked against these specific
	// feed IDs.
	const packs = useMemo< ResolvedPack[] >(
		() =>
			getTopicGroups()
				.map( ( group ) => ( { ...group, blogs: getPackBlogs( group.tags ) } ) )
				// Hide the "Most Subscribed" placeholder while it has nothing to subscribe to.
				.filter( ( pack ) => pack.tags.length > 0 || pack.blogs.length > 0 ),
		[]
	);

	const isBlogFollowed = ( blog: CuratedBlog ): boolean =>
		reduxFollows.some(
			( f ) =>
				( blog.feed_ID && f.feed_ID === blog.feed_ID ) ||
				( blog.site_ID && f.blog_ID === blog.site_ID )
		);

	const isPackSubscribed = ( pack: ResolvedPack ): boolean => {
		const tagsFollowed = pack.tags.every( ( tag ) => followedTags.includes( tag ) );
		const blogsFollowed = pack.blogs.every( isBlogFollowed );
		return tagsFollowed && blogsFollowed;
	};

	const isContinueDisabled = followedTags.length < 4;

	const handleTopicChange = ( checked: boolean, tag: string ) => {
		// If the tag is already being processed, do nothing.
		if ( processingTags.has( tag ) ) {
			return null;
		}

		// Mark the tag as being processed.
		setProcessingTags( ( current ) => new Set( current ).add( tag ) );

		// Follow or unfollow the tag and update the followed tags state for the UI.
		if ( checked ) {
			dispatch( requestFollowTag( tag ) );
			setFollowedTags( ( currentTags ) => [ ...currentTags, tag ] );
			recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_tag_followed`, {
				tag,
				total_followed: followedTags.length + 1,
			} );
		} else {
			dispatch( requestUnfollowTag( tag ) );
			setFollowedTags( ( currentTags ) => currentTags.filter( ( t ) => t !== tag ) );
			recordTracksEvent(
				`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_tag_unfollowed`,
				{
					tag,
					total_followed: followedTags.length - 1,
				}
			);
		}

		// Set a maximum number of attempts to check if the tag has been processed.
		let attempts = 0;
		const MAX_ATTEMPTS = 100; // 100 * 100ms = 10 seconds

		// Poll to check if the tag has been processed (followed or unfollowed).
		const checkStateInterval = setInterval( () => {
			attempts++;

			// Get the current followed tags from the state.
			const currentFollowedTags = getReaderFollowedTags( reduxStore.getState() ) || [];
			const stateTagSlugs = currentFollowedTags.map( ( t: Tag ) => t.slug );

			// Check if the tag is now being followed or unfollowed.
			const isStateUpdated = checked
				? stateTagSlugs.includes( tag )
				: ! stateTagSlugs.includes( tag );

			// If the state has been updated or we've reached the maximum number of attempts, clear the interval and remove the tag from the processing set.
			if ( isStateUpdated || attempts >= MAX_ATTEMPTS ) {
				clearInterval( checkStateInterval );
				setProcessingTags( ( current ) => {
					const updated = new Set( current );
					updated.delete( tag );
					return updated;
				} );
			}
		}, 100 );
	};

	const handlePackSubscribe = ( pack: ResolvedPack ) => {
		if ( busyPacks.has( pack.id ) || isPackSubscribed( pack ) ) {
			return;
		}

		setBusyPacks( ( current ) => new Set( current ).add( pack.id ) );

		// Follow any tags in the pack we're not already following. Reuse the
		// existing per-tag handler so the busy/processing semantics, optimistic
		// state update, and tracks events stay consistent with single-tag toggles.
		pack.tags.forEach( ( tag ) => {
			if ( ! followedTags.includes( tag ) ) {
				handleTopicChange( true, tag );
			}
		} );

		// Follow any blogs in the pack we're not already following.
		pack.blogs.forEach( ( blog ) => {
			if ( isBlogFollowed( blog ) ) {
				return;
			}
			const followData: { feed_ID: number; blog_ID?: number } = { feed_ID: blog.feed_ID };
			if ( blog.site_ID && blog.site_ID > 0 ) {
				followData.blog_ID = blog.site_ID;
			}
			dispatch( follow( blog.site_URL, followData, null ) );
		} );

		recordTracksEvent(
			`${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }interests_modal_pack_subscribed`,
			{
				pack_id: pack.id,
				tag_count: pack.tags.length,
				blog_count: pack.blogs.length,
			}
		);

		// Release the busy state on the next tick — Redux state for follows and
		// tags updates synchronously so isPackSubscribed will start returning
		// true immediately, which renders the locked "Subscribed" state.
		setTimeout( () => {
			setBusyPacks( ( current ) => {
				const updated = new Set( current );
				updated.delete( pack.id );
				return updated;
			} );
		}, 0 );
	};

	const handleContinue = () => {
		if ( ! isContinueDisabled ) {
			onClose();
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

	const categories: Category[] = [
		{
			name: __( 'Lifestyle & Personal Development' ),
			topics: [
				{ name: __( 'Health' ), tag: 'health' },
				{ name: __( 'Personal Finance' ), tag: 'personal-finance' },
				{ name: __( 'Food' ), tag: 'food' },
				{ name: __( 'Life Hacks' ), tag: 'life-hacks' },
				{ name: __( 'Mental Health' ), tag: 'mental-health' },
				{ name: __( 'Sleep' ), tag: 'sleep' },
				{ name: __( 'Relationships' ), tag: 'relationships' },
				{ name: __( 'Parenting' ), tag: 'parenting' },
				{ name: __( 'Travel' ), tag: 'travel' },
			],
		},
		{
			name: __( 'Technology & Innovation' ),
			topics: [
				{ name: __( 'Gadgets' ), tag: 'gadgets' },
				{ name: __( 'Software' ), tag: 'software' },
				{ name: __( 'Tech News' ), tag: 'technology' },
				{ name: __( 'Design' ), tag: 'design' },
				{ name: __( 'Artificial Intelligence' ), tag: 'artificial-intelligence' },
				{ name: __( 'Cybersecurity' ), tag: 'cybersecurity' },
				{ name: __( 'Gaming' ), tag: 'gaming' },
				{ name: __( 'Crypto' ), tag: 'cryptocurrency' },
				{ name: __( 'Science' ), tag: 'science' },
			],
		},
		{
			name: __( 'Creative Arts & Entertainment' ),
			topics: [
				{ name: __( 'Music' ), tag: 'music' },
				{ name: __( 'Movies' ), tag: 'movies' },
				{ name: __( 'Books' ), tag: 'books' },
				{ name: __( 'Art' ), tag: 'art' },
				{ name: __( 'Theatre & Performance' ), tag: 'theatre' },
				{ name: __( 'Creative Writing' ), tag: 'writing' },
				{ name: __( 'Architecture' ), tag: 'architecture' },
				{ name: __( 'Photography' ), tag: 'photography' },
				{ name: __( 'DIY Projects' ), tag: 'diy' },
			],
		},
		{
			name: __( 'Society & Culture' ),
			topics: [
				{ name: __( 'Education' ), tag: 'education' },
				{ name: __( 'Nature' ), tag: 'nature' },
				{ name: __( 'Future' ), tag: 'future' },
				{ name: __( 'Politics' ), tag: 'politics' },
				{ name: __( 'Climate' ), tag: 'climate-change' },
				{ name: __( 'History' ), tag: 'history' },
				{ name: __( 'Society' ), tag: 'society' },
				{ name: __( 'Culture' ), tag: 'culture' },
				{ name: __( 'Philosophy' ), tag: 'philosophy' },
			],
		},
		{
			name: __( 'Industry' ),
			topics: [
				{ name: __( 'Business' ), tag: 'business' },
				{ name: __( 'Startups' ), tag: 'startups' },
				{ name: __( 'Finance' ), tag: 'finance' },
				{ name: __( 'Space' ), tag: 'space' },
				{ name: __( 'Leadership' ), tag: 'leadership' },
				{ name: __( 'Marketing' ), tag: 'marketing' },
				{ name: __( 'Remote Work' ), tag: 'remote-work' },
				{ name: __( 'SaaS' ), tag: 'saas' },
				{ name: __( 'Creator Economy' ), tag: 'creator-economy' },
			],
		},
	];

	return (
		isOpen && (
			<Modal onRequestClose={ onClose } size="large" className="interests-modal">
				<VStack spacing={ 8 } className="interests-modal__content">
					<VStack spacing={ 0 }>
						<h2 className="interests-modal__title">{ __( 'What topics interest you?' ) }</h2>
						<p className="interests-modal__subtitle">
							{ __(
								'​​Stay up-to-date with your favorite blogs and discover new voices—all from one place.'
							) }
						</p>
						<p className="interests-modal__subtitle">
							{ fixMe( {
								text: 'Pick a pack that describes your interest, or switch to individual topics.',
								newCopy: __(
									'Pick a pack that describes your interest, or switch to individual topics.'
								),
								oldCopy: __( 'Follow at least 3 topics to personalize your Reader feed.' ),
							} ) }
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
										isBusy={ busyPacks.has( pack.id ) }
										onSubscribe={ () => handlePackSubscribe( pack ) }
									/>
								</div>
							) ) }
						</div>
					) }

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

					{ showAllTopics && (
						<div
							className="interests-modal__topics-pills"
							role="group"
							aria-label={ __( 'Topics' ) }
						>
							{ categories
								.flatMap( ( category ) => category.topics )
								.map( ( topic ) => {
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
											onClick={ () => handleTopicChange( ! checked, topic.tag ) }
										>
											{ topic.name }
										</button>
									);
								} ) }
						</div>
					) }

					<div className="reader-onboarding-modal__footer">
						<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
							<StepIndicator totalSteps={ 3 } currentStep={ 2 } />
							<HStack
								spacing={ 2 }
								justify="right"
								className="reader-onboarding-modal__footer-buttons"
							>
								<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
									{ __( 'Cancel' ) }
								</Button>
								<Button
									__next40pxDefaultSize
									onClick={ handleContinue }
									variant="primary"
									disabled={ isContinueDisabled }
									accessibleWhenDisabled
								>
									{ __( 'Continue' ) }
								</Button>
							</HStack>
						</HStack>
					</div>
				</VStack>
			</Modal>
		)
	);
};

export default InterestsModal;
