import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { cloneElement, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import useCourseQuery from 'calypso/data/courses/use-course-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getOriginalUserSetting from 'calypso/state/selectors/get-original-user-setting';
import VideoPlayer from './video-player';
import './style.scss';

const VideosUi = ( { headerBar, footerBar } ) => {
	const translate = useTranslate();

	const courseSlug = 'blogging-quick-start';
	const { data: course } = useCourseQuery( courseSlug, { retry: false } );

	const userCourseProgression = useSelector( ( state ) => {
		const courses = getOriginalUserSetting( state, 'courses' );
		return courses !== null && courseSlug in courses ? courses[ courseSlug ] : [];
	} );

	const [ selectedVideoIndex, setSelectedVideoIndex ] = useState( null );
	const [ currentVideoKey, setCurrentVideoKey ] = useState( null );
	const [ currentVideo, setCurrentVideo ] = useState( null );
	const [ isPlaying, setIsPlaying ] = useState( false );

	const videoRef = useRef( null );

	const onVideoPlayClick = ( videoSlug, videoInfo ) => {
		recordTracksEvent( 'calypso_courses_play_click', {
			course: course.slug,
			video: videoSlug,
		} );

		setCurrentVideo( videoInfo );
		setIsPlaying( true );
	};

	useEffect( () => {
		if ( videoRef.current ) {
			videoRef.current.onplay = () => {
				setIsPlaying( true );
			};

			videoRef.current.onpause = () => {
				setIsPlaying( false );
			};
		}
	} );

	useEffect( () => {
		const videoKeys = Object.keys( course.videos );
		if ( ! currentVideoKey && course ) {
			const initialVideoId = 'find-theme';
			setCurrentVideoKey( initialVideoId );
			setSelectedVideoIndex( videoKeys.indexOf( initialVideoId ) );
		}

		const viewedVideos = Object.keys( userCourseProgression );
		if ( viewedVideos.length > 0 ) {
			const nextVideos = videoKeys.slice(
				( videoKeys.indexOf( viewedVideos.at( -1 ) ) + 1 ) % videoKeys.length
			);
			const nextVideo = nextVideos.find( ( x ) => ! viewedVideos.includes( x ) );
			if ( nextVideo ) {
				setCurrentVideoKey( nextVideo );
				setSelectedVideoIndex( videoKeys.indexOf( nextVideo ) );
			}
		}
	}, [ currentVideoKey, course ] );

	useEffect( () => {
		if ( currentVideoKey && course ) {
			setCurrentVideo( course.videos[ currentVideoKey ] );
			setSelectedVideoIndex( Object.keys( course.videos ).indexOf( currentVideoKey ) );
		}
	}, [ currentVideoKey, course ] );

	const isVideoSelected = ( idx ) => {
		return selectedVideoIndex === idx;
	};

	const onVideoSelected = ( idx ) => {
		if ( isVideoSelected( idx ) ) {
			setSelectedVideoIndex( null );
		} else {
			setSelectedVideoIndex( idx );
		}
	};

	useEffect( () => {
		if ( course ) {
			recordTracksEvent( 'calypso_courses_view', {
				course: course.slug,
			} );
		}
	}, [ course ] );

	return (
		<div className="videos-ui">
			<div className="videos-ui__header">
				{ headerBar }
				<div className="videos-ui__header-content">
					<div className="videos-ui__titles">
						<h2>{ translate( 'Watch five videos.' ) }</h2>
						<h2>{ translate( 'Save yourself hours.' ) }</h2>
					</div>
					<div className="videos-ui__summary">
						<ul>
							<li>
								<Gridicon icon="checkmark" size={ 18 } />{ ' ' }
								{ translate( 'Learn the basics of blogging' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 18 } />{ ' ' }
								{ translate( 'Familiarize yourself with WordPress' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 18 } /> { translate( 'Upskill and save hours' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 18 } />{ ' ' }
								{ translate( 'Set yourself up for blogging success' ) }
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div className="videos-ui__body">
				<div className="videos-ui__body-title">
					<h3>{ course && course.title }</h3>
				</div>
				<div className="videos-ui__video-content">
					{ currentVideo && (
						<VideoPlayer
							videoRef={ videoRef }
							videoUrl={ currentVideo.url }
							isPlaying={ isPlaying }
							poster={ currentVideo.poster ? currentVideo.poster : false }
						/>
					) }
					<div className="videos-ui__chapters">
						{ course &&
							Object.entries( course.videos ).map( ( data, i ) => {
								const isVideoCompleted =
									data[ 0 ] in userCourseProgression && userCourseProgression[ data[ 0 ] ];
								const videoInfo = data[ 1 ];

								return (
									<div
										key={ i }
										className={ `${ isVideoSelected( i ) ? 'selected ' : '' }videos-ui__chapter` }
									>
										<button
											type="button"
											className="videos-ui__chapter-accordion-toggle"
											onClick={ () => onVideoSelected( i ) }
										>
											<span className="videos-ui__video-title">
												{ i + 1 }. { videoInfo.title }{ ' ' }
											</span>
											<span className="videos-ui__duration"> { videoInfo.duration } </span>{ ' ' }
											{ isVideoCompleted && (
												<span className="videos-ui__completed-checkmark">
													<Gridicon icon="checkmark" size={ 12 } />
												</span>
											) }
											{ isVideoSelected( i ) && ! isVideoCompleted && (
												<span className="videos-ui__status-icon">
													<Gridicon icon="chevron-up" size={ 18 } />
												</span>
											) }
											{ ! isVideoSelected( i ) && ! isVideoCompleted && (
												<span className="videos-ui__status-icon">
													<Gridicon icon="chevron-down" size={ 18 } />
												</span>
											) }
										</button>
										<div className="videos-ui__active-video-content">
											<div>
												<p>{ videoInfo.description } </p>
												<Button
													className={ classNames( 'videos-ui__button', {
														'videos-ui__video-completed': isVideoCompleted,
													} ) }
													onClick={ () => onVideoPlayClick( data[ 0 ], videoInfo ) }
												>
													<svg
														width="12"
														height="14"
														viewBox="0 0 12 14"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M1.9165 1.75L10.0832 7L1.9165 12.25V1.75Z"
															fill="#101517"
															stroke="#101517"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
														/>
													</svg>
													<span>{ translate( 'Play video' ) }</span>
												</Button>
											</div>
										</div>
									</div>
								);
							} ) }
					</div>
				</div>
			</div>
			{ course && cloneElement( footerBar, { course: course } ) }
		</div>
	);
};

export default VideosUi;
