import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { cloneElement, useEffect, useState } from 'react';
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

	const [ currentVideoKey, setCurrentVideoKey ] = useState( null );
	const [ currentVideo, setCurrentVideo ] = useState( null );
	const [ isPlaying, setIsPlaying ] = useState( false );

	const onVideoPlayClick = ( videoSlug, videoInfo ) => {
		recordTracksEvent( 'calypso_courses_play_click', {
			course: course.slug,
			video: videoSlug,
		} );

		setCurrentVideo( videoInfo );
		setCurrentVideoKey( videoSlug );
		setIsPlaying( true );
	};

	useEffect( () => {
		if ( ! course ) {
			return;
		}
		const videoSlugs = Object.keys( course.videos );
		const viewedSlugs = Object.keys( userCourseProgression );
		if ( viewedSlugs.length > 0 ) {
			const nextSlug = videoSlugs.find( ( slug ) => ! viewedSlugs.includes( slug ) );
			if ( nextSlug ) {
				setCurrentVideoKey( nextSlug );
				setSelectedChapterIndex( videoSlugs.indexOf( nextSlug ) );
				return;
			}
		}
		const initialVideoId = 'find-theme';
		setCurrentVideoKey( initialVideoId );
		setSelectedChapterIndex( videoSlugs.indexOf( initialVideoId ) );
	}, [ course, userCourseProgression ] );

	const isVideoSelected = ( idx ) => {
		return Object.keys( course.videos ).indexOf( currentVideoKey ) === idx;
	};

	const onVideoSelected = ( idx ) => {
		if ( isVideoSelected( idx ) ) {
			setCurrentVideoKey( null );
		} else {
			const selectedVideoKey = Object.keys( course.videos )[ idx ];
			setCurrentVideoKey( selectedVideoKey );
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
							videoData={ { ...currentVideo, ...{ slug: currentVideoKey } } }
							onVideoPlayStatusChanged={ ( isVideoPlaying ) => setIsPlaying( isVideoPlaying ) }
							isPlaying={ isPlaying }
							course={ course }
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
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
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
