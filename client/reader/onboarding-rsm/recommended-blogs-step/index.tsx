import { recordTracksEvent } from '@automattic/calypso-analytics';
import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	Notice,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RecommendedBlogGroups } from 'calypso/reader/components/recommended-blog-groups';
import { StepIndicator } from 'calypso/reader/components/step-indicator';
import { useFollowSite } from 'calypso/reader/data/site-subscriptions';
import { useFollowedTags } from 'calypso/reader/data/tags';
import {
	READER_ONBOARDING_FOLLOW_SOURCE,
	READER_ONBOARDING_TRACKS_EVENT_PREFIX,
} from 'calypso/reader/onboarding-rsm/constants';
import { getRecommendedBlogGroups } from 'calypso/reader/onboarding-rsm/recommended-blogs/groups';
import SubscribeVerificationNudge from 'calypso/reader/onboarding-rsm/subscribe-modal/verificationNudge';
import type { RecommendedBlog } from 'calypso/reader/onboarding-rsm/recommended-blogs';

import './style.scss';

type RecommendedBlogsStepProps = {
	promptVerification: boolean;
	onFinish: () => void;
};

/**
 * Step 3 of Reader onboarding: researched blogs for the reader's interests,
 * picked as pills and followed together on Continue.
 */
export function RecommendedBlogsStep( {
	promptVerification,
	onFinish,
}: RecommendedBlogsStepProps ) {
	const { data: followedTags, isLoading: tagsLoading } = useFollowedTags();
	const followedTagSlugs = useMemo(
		() => followedTags?.map( ( tag ) => tag.slug ) ?? [],
		[ followedTags ]
	);
	const groups = useMemo(
		() => getRecommendedBlogGroups( followedTagSlugs ),
		[ followedTagSlugs ]
	);

	const [ selected, setSelected ] = useState< ReadonlyMap< number, RecommendedBlog > >(
		() => new Map()
	);
	const [ isFollowing, setIsFollowing ] = useState( false );
	const [ failedCount, setFailedCount ] = useState( 0 );
	const { mutateAsync: followSite } = useFollowSite();
	// A batch outlives the step if the reader leaves it, for example with Back,
	// and must not finish onboarding then.
	const isMountedRef = useRef( false );
	useEffect( () => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, [] );

	const selectedFeedIds = useMemo( () => new Set( selected.keys() ), [ selected ] );

	const handleToggle = useCallback( ( blog: RecommendedBlog ) => {
		setSelected( ( previous ) => {
			const next = new Map( previous );
			if ( next.has( blog.feed_ID ) ) {
				next.delete( blog.feed_ID );
			} else {
				next.set( blog.feed_ID, blog );
			}
			return next;
		} );
	}, [] );

	const handleBlogHidden = useCallback( ( blog: RecommendedBlog ) => {
		setSelected( ( previous ) => {
			if ( ! previous.has( blog.feed_ID ) ) {
				return previous;
			}
			const next = new Map( previous );
			next.delete( blog.feed_ID );
			return next;
		} );
	}, [] );

	const handleSkip = useCallback( () => {
		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }recommended_blogs_skipped`, {
			selected_count: selected.size,
		} );
		onFinish();
	}, [ onFinish, selected.size ] );

	const handleContinue = useCallback( async () => {
		const blogs = Array.from( selected.values() );
		if ( blogs.length === 0 ) {
			onFinish();
			return;
		}

		setIsFollowing( true );
		setFailedCount( 0 );
		// One at a time: a failed follow rolls the subscriptions cache back to its
		// state when that follow started, which would drop follows that overlapped it.
		const failed: RecommendedBlog[] = [];
		for ( const blog of blogs ) {
			try {
				await followSite( { feedUrl: blog.feed_URL, source: READER_ONBOARDING_FOLLOW_SOURCE } );
			} catch {
				failed.push( blog );
			}
		}
		setIsFollowing( false );

		recordTracksEvent( `${ READER_ONBOARDING_TRACKS_EVENT_PREFIX }recommended_blogs_followed`, {
			selected_count: blogs.length,
			failed_count: failed.length,
		} );

		if ( ! isMountedRef.current ) {
			return;
		}

		if ( failed.length === 0 ) {
			onFinish();
			return;
		}

		setSelected( new Map( failed.map( ( blog ) => [ blog.feed_ID, blog ] ) ) );
		setFailedCount( failed.length );
	}, [ followSite, onFinish, selected ] );

	const selectedCount = selected.size;
	const isBusy = isFollowing || promptVerification;

	const continueLabel =
		selectedCount > 0
			? sprintf(
					/* translators: %s is the number of blogs the reader picked. */
					_n(
						'Subscribe to %s blog and continue',
						'Subscribe to %s blogs and continue',
						selectedCount
					),
					formatNumber( selectedCount )
				)
			: __( 'Continue' );

	return (
		<>
			{ promptVerification && <SubscribeVerificationNudge /> }
			<div
				className="recommended-blogs-step__content"
				inert={ promptVerification ? true : undefined }
			>
				<VStack spacing={ 2 } className="recommended-blogs-step__intro">
					<h2 className="recommended-blogs-step__title">
						{ __( 'Find your next favorite blog' ) }
					</h2>
					<p className="recommended-blogs-step__description">
						{ __( 'Pick a few blogs to make your Reader feel like you.' ) }
					</p>
				</VStack>

				{ tagsLoading && <Spinner /> }

				{ ! tagsLoading && groups.length === 0 && (
					<p className="recommended-blogs-step__empty">
						{ __(
							'We don’t have blog recommendations for your interests yet. You can find more blogs in Search anytime.'
						) }
					</p>
				) }

				{ ! tagsLoading && groups.length > 0 && (
					<RecommendedBlogGroups
						mode="select"
						groups={ groups }
						selectedFeedIds={ selectedFeedIds }
						onToggle={ handleToggle }
						onBlogHidden={ handleBlogHidden }
						disabled={ isBusy }
					/>
				) }
			</div>
			{ failedCount > 0 && (
				<Notice status="error" isDismissible={ false } className="recommended-blogs-step__error">
					{ sprintf(
						/* translators: %s is the number of blogs that couldn't be subscribed to. */
						_n(
							'We couldn’t subscribe you to %s blog. Try again, or skip for now.',
							'We couldn’t subscribe you to %s blogs. Try again, or skip for now.',
							failedCount
						),
						formatNumber( failedCount )
					) }
				</Notice>
			) }
			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<StepIndicator totalSteps={ 3 } currentStep={ 3 } />
					<HStack spacing={ 2 } justify="right" className="reader-onboarding-modal__footer-buttons">
						<p className="recommended-blogs-step__count" aria-live="polite">
							{ selectedCount > 0
								? sprintf(
										/* translators: %s is the number of blogs the reader picked. */
										_n( '%s blog selected', '%s blogs selected', selectedCount ),
										formatNumber( selectedCount )
									)
								: '' }
						</p>
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							onClick={ handleSkip }
							disabled={ isBusy }
							accessibleWhenDisabled
						>
							{ __( 'Skip for now' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ handleContinue }
							isBusy={ isFollowing }
							disabled={ isBusy }
							accessibleWhenDisabled
						>
							{ continueLabel }
						</Button>
					</HStack>
				</HStack>
			</div>
		</>
	);
}
