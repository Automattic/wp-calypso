import page from '@automattic/calypso-router';
import {
	Button,
	Modal,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import EmptyContent from 'calypso/components/empty-content';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import { useFourForFour, useFourForFourReview } from 'calypso/reader/data/four-for-four';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { READER_FOUR_FOR_FOUR } from 'calypso/reader/follow-sources';
import { getSiteDescription, getSiteName } from 'calypso/reader/get-helpers';
import { TypedStream } from 'calypso/reader/stream/typed';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import {
	FOUR_FOR_FOUR_FOLLOW_API_SOURCE,
	FOUR_FOR_FOUR_PREVIEW_QUERY,
	FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS,
	FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX,
} from './constants';
import type { ReadFourForFourCandidate, ReadFourForFourReviewVerdict } from '@automattic/api-core';

// The modal reuses the Reader onboarding discover step's frame and layout.
import 'calypso/reader/onboarding-rsm/style.scss';
import 'calypso/reader/onboarding-rsm/subscribe-modal/style.scss';
import './style.scss';

const TITLE_ID = 'four-for-four-modal-title';

const getCandidateName = ( candidate: ReadFourForFourCandidate ) =>
	getSiteName( { site: candidate.site } ) ?? candidate.name;

function SiteDetails( { candidate }: { candidate: ReadFourForFourCandidate } ) {
	const description = getSiteDescription( { site: candidate.site } );
	return (
		<>
			<SiteIcon size={ 32 } iconUrl={ candidate.icon ?? undefined } />
			<span className="four-for-four-modal__site-byline">
				<span className="four-for-four-modal__site-name">{ getCandidateName( candidate ) }</span>
				{ description && (
					<span className="four-for-four-modal__site-description">{ description }</span>
				) }
			</span>
		</>
	);
}

function FollowButton( { candidate }: { candidate: ReadFourForFourCandidate } ) {
	return (
		<ReaderFollowButton
			siteUrl={ candidate.feedUrl || candidate.url }
			feedId={ candidate.feedId ?? undefined }
			siteId={ candidate.blogId }
			followApiSource={ FOUR_FOR_FOUR_FOLLOW_API_SOURCE }
			followSource={ READER_FOUR_FOR_FOUR }
			hasButtonStyle
			followIcon={ <></> }
			followingIcon={
				<Icon key="following" className="reader-following-feed" icon={ check } size={ 18 } />
			}
		/>
	);
}

function SiteReviewPending( { isReviewing }: { isReviewing: boolean } ) {
	const translate = useTranslate();
	return (
		<VStack
			className="subscribe-modal__container four-for-four-modal__review"
			alignment="center"
			justify="center"
			spacing={ 4 }
		>
			<Spinner />
			{ isReviewing && (
				<p className="subscribe-modal__description" role="status">
					{ translate( 'Checking your site to see if it qualifies…' ) }
				</p>
			) }
		</VStack>
	);
}

function SiteNotEligible( {
	verdict,
	onClose,
}: {
	verdict: Extract< ReadFourForFourReviewVerdict, 'not_personal_blog' | 'not_english' >;
	onClose: () => void;
} ) {
	const translate = useTranslate();
	return (
		<VStack
			className="subscribe-modal__container four-for-four-modal__review"
			alignment="center"
			justify="center"
			spacing={ 6 }
		>
			<VStack alignment="center" spacing={ 2 } expanded={ false }>
				<h2 id={ TITLE_ID } className="subscribe-modal__title">
					{ verdict === 'not_english'
						? translate( '4 for 4 is English-only for now' )
						: translate( '4 for 4 is for personal blogs' ) }
				</h2>
				<p className="subscribe-modal__description">
					{ verdict === 'not_english'
						? translate(
								"Sorry, we can only include sites written in English right now, so we can't include yours."
							)
						: translate(
								"Sorry, we're mainly looking for personal blogs right now, where people write about their own stories, life, hobbies or travel, so we can't include your site."
							) }
				</p>
			</VStack>
			<Button __next40pxDefaultSize variant="primary" onClick={ onClose }>
				{ translate( 'Back to Reader' ) }
			</Button>
		</VStack>
	);
}

/**
 * The writer's site is checked before the list is shown, so nobody subscribes
 * to 4 sites and only then finds out their own site won't be shown.
 */
export function FourForFour() {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const recordTracksRef = useRef( recordReaderTracksEvent );
	recordTracksRef.current = recordReaderTracksEvent;

	const { isLoadingStatus, isReviewing, verdict } = useFourForFourReview();
	const isNotEligible = verdict === 'not_personal_blog' || verdict === 'not_english';
	const isShowingSites = ! isLoadingStatus && ! isReviewing && ! isNotEligible;

	const {
		candidates,
		isLoadingCandidates,
		isCandidatesError,
		refetchCandidates,
		status,
		followedCount,
		failedSites,
		hasSaveError,
		retrySave,
	} = useFourForFour();

	const hasPreview = useMediaQuery( FOUR_FOR_FOUR_PREVIEW_QUERY );
	const [ selectedBlogId, setSelectedBlogId ] = useState< number | null >( null );
	const selectedCandidate =
		candidates.find( ( candidate ) => candidate.blogId === selectedBlogId ) ?? candidates[ 0 ];

	// Reset the preview scroll and record the preview whenever the selection
	// changes or the preview comes into view, including the initial default
	// selection.
	const previewRef = useRef< HTMLDivElement | null >( null );
	useEffect( () => {
		if ( ! selectedCandidate || ! hasPreview || ! isShowingSites ) {
			return;
		}
		if ( previewRef.current ) {
			previewRef.current.scrollTop = 0;
		}
		recordTracksRef.current( `${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }site_previewed`, {
			blog_id: selectedCandidate.blogId,
			is_participant: selectedCandidate.isParticipant ? 1 : 0,
		} );
	}, [ selectedCandidate?.blogId, hasPreview, isShowingSites ] ); // eslint-disable-line react-hooks/exhaustive-deps -- keyed on the id, not the object

	const isComplete = status === 'completed';
	const progressCount = Math.min( followedCount, FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS );
	const progressLabel = String(
		translate( '%(count)d of %(total)d subscribed', {
			args: { count: progressCount, total: FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS },
		} )
	);

	const handleClose = () => {
		recordTracksRef.current( `${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }closed`, {
			followed_count: followedCount,
			is_complete: isComplete ? 1 : 0,
		} );
		page( '/reader' );
	};

	const modalProps = {
		onRequestClose: handleClose,
		size: 'medium',
		className: 'reader-onboarding-rsm-modal subscribe-modal four-for-four-modal',
		aria: { labelledby: TITLE_ID },
	} as const;

	// Every branch renders the same Modal at the root, so React keeps the open
	// modal and swaps only its contents, instead of replaying its open animation.
	if ( isNotEligible ) {
		return (
			<Modal { ...modalProps }>
				<SiteNotEligible verdict={ verdict } onClose={ handleClose } />
			</Modal>
		);
	}
	if ( ! isShowingSites ) {
		return (
			<Modal { ...modalProps } contentLabel={ String( translate( 'Subscribe to 4 new writers' ) ) }>
				<SiteReviewPending isReviewing={ isReviewing } />
			</Modal>
		);
	}

	return (
		<Modal { ...modalProps }>
			<div className="subscribe-modal__container">
				<div className="subscribe-modal__content">
					<div className="subscribe-modal__intro">
						<h2 id={ TITLE_ID } className="subscribe-modal__title">
							{ translate( 'Subscribe to 4 new writers' ) }
						</h2>
						<p className="subscribe-modal__description">
							{ translate(
								'Click a site to preview it, then subscribe to any 4 that interest you. Once you do, your site can be shown here to other new writers.'
							) }
						</p>
					</div>

					{ isComplete && (
						<HStack
							className="four-for-four-modal__complete"
							alignment="left"
							// Not full width: the side margins would push it past the modal.
							expanded={ false }
							spacing={ 3 }
							role="status"
						>
							<Icon icon={ check } size={ 28 } className="four-for-four-modal__complete-icon" />
							<VStack spacing={ 1 } expanded={ false }>
								<strong>{ translate( "You're in!" ) }</strong>
								<span>
									{ translate(
										'Your site can now be shown to other new writers. Every extra subscription moves you further up the list.'
									) }
								</span>
							</VStack>
						</HStack>
					) }

					{ hasSaveError && (
						<HStack
							className="four-for-four-modal__save-error"
							alignment="left"
							expanded={ false }
							spacing={ 3 }
							role="alert"
						>
							<span>{ translate( "We couldn't save your progress." ) }</span>
							<Button variant="link" onClick={ retrySave }>
								{ translate( 'Try again' ) }
							</Button>
						</HStack>
					) }

					{ failedSites.length > 0 && (
						<HStack
							className="four-for-four-modal__follow-error"
							alignment="left"
							expanded={ false }
							role="alert"
						>
							<span>
								{ failedSites.length === 1
									? translate(
											'We were unable to subscribe you to %(siteName)s. Please pick another site from the list.',
											{ args: { siteName: failedSites[ 0 ].name } }
										)
									: translate(
											'We were unable to subscribe you to some of these sites. Please pick others from the list.'
										) }
							</span>
						</HStack>
					) }

					<div className="subscribe-modal__columns">
						<div className="subscribe-modal__site-list-column">
							{ isLoadingCandidates && (
								<div className="four-for-four-modal__loading">
									<Spinner />
								</div>
							) }
							{ isCandidatesError && (
								<EmptyContent
									isCompact
									title={ translate( "We couldn't load sites right now." ) }
									action={ translate( 'Try again' ) }
									actionCallback={ () => refetchCandidates() }
								/>
							) }
							{ ! isLoadingCandidates && ! isCandidatesError && candidates.length === 0 && (
								<EmptyContent
									isCompact
									title={ translate( 'No new writers to show right now.' ) }
									line={ translate( 'The list refreshes as new writers publish.' ) }
									action={ translate( 'Check again' ) }
									actionCallback={ () => refetchCandidates() }
								/>
							) }
							{ candidates.length > 0 && (
								<div className="subscribe-modal__recommended-sites">
									{ candidates.map( ( candidate ) =>
										hasPreview ? (
											<button
												key={ candidate.blogId }
												type="button"
												className={ clsx(
													'subscribe-modal__site-card',
													'four-for-four-modal__site',
													{ 'is-selected': selectedCandidate?.blogId === candidate.blogId }
												) }
												aria-pressed={ selectedCandidate?.blogId === candidate.blogId }
												onClick={ () => setSelectedBlogId( candidate.blogId ) }
											>
												<SiteDetails candidate={ candidate } />
											</button>
										) : (
											<div
												key={ candidate.blogId }
												className="subscribe-modal__site-card four-for-four-modal__site"
											>
												<SiteDetails candidate={ candidate } />
												<FollowButton candidate={ candidate } />
											</div>
										)
									) }
								</div>
							) }
						</div>
						<div className="subscribe-modal__preview-column">
							<div className="subscribe-modal__preview-placeholder">
								{ selectedCandidate && hasPreview && (
									<>
										<div className="subscribe-modal__preview-stream-header">
											<div className="subscribe-modal__preview-site">
												<SiteIcon size={ 36 } iconUrl={ selectedCandidate.icon ?? undefined } />
												<span className="subscribe-modal__preview-site-title">
													{ getCandidateName( selectedCandidate ) }
												</span>
											</div>
											<FollowButton
												key={ selectedCandidate.blogId }
												candidate={ selectedCandidate }
											/>
										</div>
										<div className="subscribe-modal__preview-stream-container" ref={ previewRef }>
											<div className="subscribe-modal__preview-stream-inner" inert>
												<TypedStream
													streamKey={ selectedCandidate.streamKey }
													className="is-site-stream subscribe-modal__preview-stream no-padding"
													followSource={ READER_FOUR_FOR_FOUR }
													useCompactCards
													showBylineSecondarySiteLink={ false }
													trackScrollPage={ trackScrollPage }
												/>
											</div>
										</div>
									</>
								) }
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<HStack
						className="four-for-four-modal__progress"
						spacing={ 2 }
						expanded={ false }
						role="progressbar"
						aria-valuemin={ 0 }
						aria-valuemax={ FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS }
						aria-valuenow={ progressCount }
						aria-label={ progressLabel }
					>
						<span className="four-for-four-modal__progress-dots" aria-hidden="true">
							{ Array.from( { length: FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS }, ( _, index ) => (
								<span
									key={ index }
									className={ clsx( 'four-for-four-modal__progress-dot', {
										'is-filled': index < progressCount,
									} ) }
								/>
							) ) }
						</span>
						<span className="four-for-four-modal__progress-label">{ progressLabel }</span>
					</HStack>
					<HStack spacing={ 2 } justify="right" className="reader-onboarding-modal__footer-buttons">
						<Button
							__next40pxDefaultSize
							variant={ isComplete ? 'primary' : 'secondary' }
							onClick={ handleClose }
						>
							{ isComplete ? translate( 'Back to Reader' ) : translate( 'Do this later' ) }
						</Button>
					</HStack>
				</HStack>
			</div>
		</Modal>
	);
}
