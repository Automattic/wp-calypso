import {
	activeAgencyQuery,
	userPreferenceOptimisticMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Card } from '../../components/card';
import { Text } from '../../components/text';
import { isOnNewAgencyDashboard } from '../lib/dashboard-opt-in';
import { useOnboardingTour } from '../onboarding-tour';
import { OWNER_ROLE } from '../team/constants';
import { WELCOME_VIDEO_CAPTIONS } from './welcome-video-captions';

import './welcome-notice.scss';

// Keyed on the opt-in's `updated_at`, so an agency that switches back and opts in again is welcomed again.
const SEEN_PREFERENCE = 'a4a-dashboard-welcome-notice-seen';

// Start times match the narration, as timed in the captions. Re-time them if the video is replaced.
const getVideoChapters = () => [
	{ id: 'home', start: 7, label: __( 'Improved Home' ) },
	{ id: 'navigation', start: 15, label: __( 'New navigation' ) },
	{ id: 'clients', start: 73, label: __( 'Clients & updated site management' ) },
	{ id: 'marketplace', start: 89, label: __( 'Marketplace & Referrals' ) },
	{ id: 'earnings', start: 147, label: __( 'Earnings dashboard' ) },
];

function formatTime( seconds: number ) {
	return `${ Math.floor( seconds / 60 ) }:${ String( seconds % 60 ).padStart( 2, '0' ) }`;
}

const INTRO_VIDEO_URL =
	'https://automattic.wordpress.com/wp-content/uploads/2026/11/automattic-agencies-msd-intro-01.mp4';

/**
 * The first visit after the agency switches, on whichever agency page they land on first,
 * since links from the classic dashboard forward to the matching page.
 */
export function useWelcomeNoticeEligibility() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	// Agencies moved here for good, like new sign-ups, can't switch back, so the notice's way back doesn't apply.
	const isOptedIn =
		isOnNewAgencyDashboard( agency ) && agency?.dashboard_opt_in?.value !== 'forced-opt-in';
	const { data: seenAt, isFetched } = useQuery( {
		...userPreferenceQuery( SEEN_PREFERENCE ),
		enabled: isOptedIn,
	} );

	return {
		isEligible: isOptedIn && isFetched && seenAt !== agency?.dashboard_opt_in?.updated_at,
		isLoading: isOptedIn && ! isFetched,
	};
}

/**
 * A same-origin URL for the captions, so the video can load them without CORS.
 */
function useCaptionsUrl( captions: string ) {
	const [ url, setUrl ] = useState< string >();

	useEffect( () => {
		const objectUrl = URL.createObjectURL( new Blob( [ captions ], { type: 'text/vtt' } ) );
		setUrl( objectUrl );
		return () => URL.revokeObjectURL( objectUrl );
	}, [ captions ] );

	return url;
}

export default function WelcomeNotice() {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { openTour } = useOnboardingTour();
	const { mutate: saveSeen } = useMutation( userPreferenceOptimisticMutation( SEEN_PREFERENCE ) );
	const markSeen = () => saveSeen( agency?.dashboard_opt_in?.updated_at ?? '' );
	const isOwner = agency?.user?.role === OWNER_ROLE;

	const hasRecordedView = useRef( false );
	useEffect( () => {
		if ( ! hasRecordedView.current ) {
			hasRecordedView.current = true;
			recordTracksEvent( 'calypso_a4a_dashboard_welcome_notice_view', { is_owner: isOwner } );
		}
	}, [ isOwner, recordTracksEvent ] );

	const handleTakeTour = () => {
		recordTracksEvent( 'calypso_a4a_dashboard_welcome_notice_tour_click' );
		markSeen();
		openTour();
	};

	const handleDismiss = () => {
		recordTracksEvent( 'calypso_a4a_dashboard_welcome_notice_dismiss' );
		markSeen();
	};

	const captionsUrl = useCaptionsUrl( WELCOME_VIDEO_CAPTIONS );
	// On Overview's wide layout, the description matches the event card beside it.
	const pathname = useRouterState( { select: ( state ) => state.location.pathname } );
	const isLargeViewport = useViewportMatch( 'large' );
	const isProminent = isLargeViewport && pathname.replace( /\/+$/, '' ) === '/overview';
	const videoRef = useRef< HTMLVideoElement >( null );
	const chapters = getVideoChapters();
	const [ currentChapterId, setCurrentChapterId ] = useState< string >();

	const handleTimeUpdate = () => {
		const time = videoRef.current?.currentTime ?? 0;
		setCurrentChapterId( chapters.findLast( ( chapter ) => time >= chapter.start )?.id );
	};

	const handleChapterClick = ( chapter: ( typeof chapters )[ number ] ) => {
		recordTracksEvent( 'calypso_a4a_dashboard_welcome_notice_chapter_click', {
			chapter: chapter.id,
			is_owner: isOwner,
		} );
		const video = videoRef.current;
		if ( ! video ) {
			return;
		}
		video.currentTime = chapter.start;
		video.play().catch( () => {} );
	};

	const hasRecordedPlay = useRef( false );
	const handleVideoPlay = () => {
		if ( ! hasRecordedPlay.current ) {
			hasRecordedPlay.current = true;
			recordTracksEvent( 'calypso_a4a_dashboard_welcome_notice_video_play', { is_owner: isOwner } );
		}
	};

	return (
		<Card className="a4a-dashboard-welcome-notice">
			<section
				className="a4a-dashboard-welcome-notice-layout"
				aria-labelledby="a4a-dashboard-welcome-notice-heading"
			>
				<Button
					className="a4a-dashboard-welcome-notice-close"
					icon={ close }
					size="small"
					label={ __( 'Close' ) }
					onClick={ handleDismiss }
					__next40pxDefaultSize
				/>
				<div className="a4a-dashboard-welcome-notice-grid">
					<VStack
						className="a4a-dashboard-welcome-notice-content"
						spacing={ 4 }
						alignment="flex-start"
						justify="flex-start"
					>
						<VStack spacing={ 2 }>
							<Heading
								id="a4a-dashboard-welcome-notice-heading"
								level={ 2 }
								size={ 20 }
								weight={ 500 }
								lineHeight="28px"
							>
								{ __( 'Welcome to the new Automattic for Agencies experience' ) }
							</Heading>
							<Text
								variant={ isProminent ? undefined : 'muted' }
								size={ isProminent ? 13 : undefined }
								lineHeight="20px"
							>
								{ isOwner
									? __(
											'You’re getting an early look at the new dashboard before it comes to every agency in December. All the benefits of the program are now grouped to help you focus on clients, growing your business, and earning opportunities. To switch back, open Agency in the sidebar and choose Classic dashboard.'
										)
									: __(
											'Your agency owner turned on an early look at the new dashboard, which comes to every agency in December. All the benefits of the program are now grouped to help you focus on clients, growing your business, and earning opportunities. Your agency owner can switch back to the classic dashboard at any time.'
										) }
							</Text>
						</VStack>
						<VStack className="a4a-dashboard-welcome-notice-chapters" spacing={ 2 }>
							<Text
								id="a4a-dashboard-welcome-notice-chapters-label"
								variant="muted"
								size={ 11 }
								weight={ 500 }
								lineHeight="16px"
								upperCase
							>
								{ __( 'In this video' ) }
							</Text>
							<ol
								className="a4a-dashboard-welcome-notice-chapter-list"
								aria-labelledby="a4a-dashboard-welcome-notice-chapters-label"
							>
								{ chapters.map( ( chapter ) => (
									<li key={ chapter.id } className="a4a-dashboard-welcome-notice-chapter-item">
										<Button
											variant="link"
											aria-current={ currentChapterId === chapter.id ? 'true' : undefined }
											aria-label={ sprintf(
												/* translators: %1$s: the chapter's name. %2$s: a time in the video, like 1:13. */
												__( 'Play %1$s, from %2$s' ),
												chapter.label,
												formatTime( chapter.start )
											) }
											onClick={ () => handleChapterClick( chapter ) }
											__next40pxDefaultSize
										>
											<Text
												className="a4a-dashboard-welcome-notice-chapter-label"
												color="inherit"
												lineHeight="20px"
												weight={ currentChapterId === chapter.id ? 600 : undefined }
											>
												{ chapter.label }
											</Text>
										</Button>
										<Text
											className="a4a-dashboard-welcome-notice-chapter-time"
											variant="muted"
											aria-hidden="true"
										>
											{ formatTime( chapter.start ) }
										</Text>
									</li>
								) ) }
							</ol>
						</VStack>
						<Button
							className="a4a-dashboard-welcome-notice-cta"
							variant="primary"
							onClick={ handleTakeTour }
							__next40pxDefaultSize
						>
							{ __( 'Take the tour' ) }
						</Button>
					</VStack>
					<video
						ref={ videoRef }
						className="a4a-dashboard-welcome-notice-video"
						src={ INTRO_VIDEO_URL }
						aria-label={ __( 'A short introduction to the new dashboard' ) }
						controls
						playsInline
						preload="metadata"
						onPlay={ handleVideoPlay }
						onTimeUpdate={ handleTimeUpdate }
					>
						{ /* Off until the viewer turns them on from the video's controls. */ }
						<track
							key={ captionsUrl }
							kind="captions"
							src={ captionsUrl }
							srcLang="en"
							label={ __( 'English' ) }
						/>
					</video>
				</div>
			</section>
		</Card>
	);
}
