import page from '@automattic/calypso-router';
import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import { useFourForFour } from 'calypso/reader/data/four-for-four';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { READER_FOUR_FOR_FOUR } from 'calypso/reader/follow-sources';
import Stream from 'calypso/reader/stream';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import {
	FOUR_FOR_FOUR_FOLLOW_API_SOURCE,
	FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS,
	FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX,
} from './constants';
import type { ReadFourForFourCandidateResponse } from '@automattic/api-core';

import './style.scss';

interface StreamProps {
	streamKey: string;
	className?: string;
	followSource?: string;
	useCompactCards?: boolean;
	showBylineSecondarySiteLink?: boolean;
	trackScrollPage?: typeof trackScrollPage;
}

const TypedStream: ComponentType< StreamProps > = Stream as ComponentType< StreamProps >;

// The list item and follow button read the Reader site shape; map the
// candidate onto the fields they use so neither has to refetch the site.
function toReaderSite( candidate: ReadFourForFourCandidateResponse ) {
	return {
		ID: candidate.blog_id,
		feed_ID: candidate.feed_id,
		title: candidate.name,
		name: candidate.name,
		URL: candidate.url,
		feed_URL: candidate.feed_url,
		description: candidate.description ?? '',
		icon: candidate.icon ? { img: candidate.icon } : undefined,
	};
}

function getStreamKey( candidate: ReadFourForFourCandidateResponse ) {
	return candidate.feed_id ? `feed:${ candidate.feed_id }` : `site:${ candidate.blog_id }`;
}

export function FourForFour() {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const {
		candidates,
		isLoadingCandidates,
		isCandidatesError,
		refetchCandidates,
		status,
		progressCount,
		isComplete,
	} = useFourForFour();

	const [ selectedBlogId, setSelectedBlogId ] = useState< number | null >( null );
	const selectedCandidate =
		candidates.find( ( candidate ) => candidate.blog_id === selectedBlogId ) ?? candidates[ 0 ];

	const previewRef = useRef< HTMLDivElement | null >( null );

	const handleItemClick = useCallback(
		( candidate: ReadFourForFourCandidateResponse ) => {
			if ( candidate.blog_id !== selectedCandidate?.blog_id ) {
				if ( previewRef.current ) {
					previewRef.current.scrollTop = 0;
				}
				recordReaderTracksEvent( `${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }site_previewed`, {
					blog_id: candidate.blog_id,
					is_participant: candidate.is_participant ? 1 : 0,
				} );
			}
			setSelectedBlogId( candidate.blog_id );
		},
		[ recordReaderTracksEvent, selectedCandidate?.blog_id ]
	);

	// Fire the completion event once, on the transition into `completed`
	// during this visit; a user who arrives already complete gets no event.
	const previousStatusRef = useRef( status );
	useEffect( () => {
		if (
			status === 'completed' &&
			previousStatusRef.current &&
			previousStatusRef.current !== 'completed'
		) {
			recordReaderTracksEvent( `${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }completed` );
		}
		previousStatusRef.current = status;
	}, [ status, recordReaderTracksEvent ] );

	const progressLabel = String(
		translate( '%(count)d of %(total)d subscribed', {
			args: { count: progressCount, total: FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS },
		} )
	);

	return (
		<div className="four-for-four">
			<VStack className="four-for-four__intro" spacing={ 2 } alignment="center">
				<h1 className="four-for-four__title">{ translate( 'Subscribe to 4 new writers' ) }</h1>
				<p className="four-for-four__description">
					{ translate(
						'Click a site to preview it, then subscribe to any 4 that interest you. Once you do, your site joins this list for other new writers to find.'
					) }
				</p>
				<HStack
					className="four-for-four__progress"
					spacing={ 2 }
					justify="center"
					role="progressbar"
					aria-valuemin={ 0 }
					aria-valuemax={ FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS }
					aria-valuenow={ progressCount }
					aria-label={ progressLabel }
				>
					<span className="four-for-four__progress-dots" aria-hidden="true">
						{ Array.from( { length: FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS }, ( _, index ) => (
							<span
								key={ index }
								className={ clsx( 'four-for-four__progress-dot', {
									'is-filled': index < progressCount,
								} ) }
							/>
						) ) }
					</span>
					<span className="four-for-four__progress-label">{ progressLabel }</span>
				</HStack>
			</VStack>

			{ isComplete && (
				<HStack className="four-for-four__complete" spacing={ 3 } role="status">
					<Icon icon={ check } size={ 28 } className="four-for-four__complete-icon" />
					<VStack spacing={ 1 } className="four-for-four__complete-text">
						<strong>{ translate( "You're in!" ) }</strong>
						<span>
							{ translate(
								'Your site is now on the list other new writers see. Every extra subscription moves you further up it.'
							) }
						</span>
					</VStack>
					<Button __next40pxDefaultSize variant="primary" onClick={ () => page( '/reader' ) }>
						{ translate( 'Back to Reader' ) }
					</Button>
				</HStack>
			) }

			<div className="four-for-four__columns">
				<div className="four-for-four__site-list-column">
					{ isLoadingCandidates && (
						<div className="four-for-four__loading">
							<Spinner />
						</div>
					) }
					{ isCandidatesError && (
						<VStack className="four-for-four__empty" spacing={ 3 } alignment="center">
							<p>{ translate( "We couldn't load sites right now." ) }</p>
							<Button variant="secondary" onClick={ () => refetchCandidates() }>
								{ translate( 'Try again' ) }
							</Button>
						</VStack>
					) }
					{ ! isLoadingCandidates && ! isCandidatesError && candidates.length === 0 && (
						<p className="four-for-four__empty">
							{ translate( 'No new writers to show right now. Check back tomorrow.' ) }
						</p>
					) }
					{ candidates.length > 0 && (
						<div className="four-for-four__recommended-sites">
							{ candidates.map( ( candidate ) => (
								<ConnectedReaderSubscriptionListItem
									key={ candidate.blog_id }
									feedId={ candidate.feed_id || undefined }
									siteId={ candidate.blog_id }
									site={ toReaderSite( candidate ) }
									url={ candidate.feed_url || candidate.url }
									showLastUpdatedDate={ false }
									showNotificationSettings={ false }
									showFollowedOnDate={ false }
									followApiSource={ FOUR_FOR_FOUR_FOLLOW_API_SOURCE }
									followSource={ READER_FOUR_FOR_FOUR }
									replaceStreamClickWithItemClick
									onItemClick={ () => handleItemClick( candidate ) }
									isSelected={ selectedCandidate?.blog_id === candidate.blog_id }
								/>
							) ) }
						</div>
					) }
				</div>
				<div className="four-for-four__preview-column">
					{ selectedCandidate && (
						<>
							<HStack className="four-for-four__preview-header" justify="space-between">
								<HStack spacing={ 2 } className="four-for-four__preview-site">
									<SiteIcon size={ 36 } iconUrl={ selectedCandidate.icon ?? undefined } />
									<span className="four-for-four__preview-site-title">
										{ selectedCandidate.name }
									</span>
								</HStack>
								<ReaderFollowButton
									key={ selectedCandidate.blog_id }
									siteUrl={ selectedCandidate.feed_url || selectedCandidate.url }
									feedId={ selectedCandidate.feed_id || undefined }
									siteId={ selectedCandidate.blog_id }
									followApiSource={ FOUR_FOR_FOUR_FOLLOW_API_SOURCE }
									followSource={ READER_FOUR_FOR_FOUR }
									hasButtonStyle
									followIcon={ <></> }
									followingIcon={
										<Icon
											key="following"
											className="reader-following-feed"
											icon={ check }
											size={ 18 }
										/>
									}
								/>
							</HStack>
							<div className="four-for-four__preview-stream-container" ref={ previewRef }>
								<div className="four-for-four__preview-stream-inner" inert>
									<TypedStream
										streamKey={ getStreamKey( selectedCandidate ) }
										className="is-site-stream four-for-four__preview-stream no-padding"
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
	);
}
