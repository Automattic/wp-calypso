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
import { useEffect, useRef, useState } from 'react';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import { SiteIcon } from 'calypso/blocks/site-icon';
import EmptyContent from 'calypso/components/empty-content';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import { useFourForFour } from 'calypso/reader/data/four-for-four';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { READER_FOUR_FOR_FOUR } from 'calypso/reader/follow-sources';
import { TypedStream } from 'calypso/reader/stream/typed';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import {
	FOUR_FOR_FOUR_FOLLOW_API_SOURCE,
	FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS,
	FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX,
} from './constants';

import './style.scss';

export function FourForFour() {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const recordTracksRef = useRef( recordReaderTracksEvent );
	recordTracksRef.current = recordReaderTracksEvent;

	const {
		candidates,
		isLoadingCandidates,
		isCandidatesError,
		refetchCandidates,
		status,
		followedCount,
		recordFollow,
	} = useFourForFour();

	const [ selectedBlogId, setSelectedBlogId ] = useState< number | null >( null );
	const selectedCandidate =
		candidates.find( ( candidate ) => candidate.blogId === selectedBlogId ) ?? candidates[ 0 ];

	// Reset the preview scroll and record the preview whenever the selection
	// changes, including the initial default selection.
	const previewRef = useRef< HTMLDivElement | null >( null );
	useEffect( () => {
		if ( ! selectedCandidate ) {
			return;
		}
		if ( previewRef.current ) {
			previewRef.current.scrollTop = 0;
		}
		recordTracksRef.current( `${ FOUR_FOR_FOUR_TRACKS_EVENT_PREFIX }site_previewed`, {
			blog_id: selectedCandidate.blogId,
			is_participant: selectedCandidate.isParticipant ? 1 : 0,
		} );
	}, [ selectedCandidate?.blogId ] ); // eslint-disable-line react-hooks/exhaustive-deps -- keyed on the id, not the object

	const handleFollowToggle = ( blogId: number, isFollowing: boolean ) => {
		if ( isFollowing ) {
			recordFollow( blogId );
		}
	};

	const isComplete = status === 'completed';
	const progressCount = Math.min( followedCount, FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS );
	const progressLabel = String(
		translate( '%(count)d of %(total)d subscribed', {
			args: { count: progressCount, total: FOUR_FOR_FOUR_REQUIRED_SUBSCRIPTIONS },
		} )
	);

	return (
		<div className="four-for-four">
			<VStack className="four-for-four__intro" spacing={ 2 } alignment="center" expanded={ false }>
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
					<VStack spacing={ 1 } className="four-for-four__complete-text" expanded={ false }>
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
						<div className="four-for-four__recommended-sites">
							{ candidates.map( ( candidate ) => (
								<ConnectedReaderSubscriptionListItem
									key={ candidate.blogId }
									feedId={ candidate.feedId ?? undefined }
									siteId={ candidate.blogId }
									site={ candidate.site }
									url={ candidate.feedUrl || candidate.url }
									showLastUpdatedDate={ false }
									showNotificationSettings={ false }
									showFollowedOnDate={ false }
									followApiSource={ FOUR_FOR_FOUR_FOLLOW_API_SOURCE }
									followSource={ READER_FOUR_FOR_FOUR }
									replaceStreamClickWithItemClick
									onItemClick={ () => setSelectedBlogId( candidate.blogId ) }
									onFollowToggle={ ( isFollowing: boolean ) =>
										handleFollowToggle( candidate.blogId, isFollowing )
									}
									isSelected={ selectedCandidate?.blogId === candidate.blogId }
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
									key={ selectedCandidate.blogId }
									siteUrl={ selectedCandidate.feedUrl || selectedCandidate.url }
									feedId={ selectedCandidate.feedId ?? undefined }
									siteId={ selectedCandidate.blogId }
									followApiSource={ FOUR_FOR_FOUR_FOLLOW_API_SOURCE }
									followSource={ READER_FOUR_FOR_FOUR }
									hasButtonStyle
									onFollowToggle={ ( isFollowing: boolean ) =>
										handleFollowToggle( selectedCandidate.blogId, isFollowing )
									}
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
										streamKey={ selectedCandidate.streamKey }
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
