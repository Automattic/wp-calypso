import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { cloneElement, useEffect, useState } from 'react';
import moment from 'moment';
import { useSelector, shallowEqual } from 'react-redux';
import useCourseQuery from 'calypso/data/courses/use-course-query';
import useUpdateUserCourseProgressionMutation from 'calypso/data/courses/use-update-user-course-progression-mutation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import getOriginalUserSetting from 'calypso/state/selectors/get-original-user-setting';
import VideoPlayer from './video-player';
import './style.scss';

const VideosUi = ( { headerBar, footerBar } ) => {
	const translate = useTranslate();

	const courseSlug = 'blogging-quick-start';
	const { data: course } = useCourseQuery( courseSlug, { retry: false } );
	const { updateUserCourseProgression } = useUpdateUserCourseProgressionMutation();

	const initialUserCourseProgression = useSelector( ( state ) => {
		const courses = getOriginalUserSetting( state, 'courses' );
		return courses !== null && courseSlug in courses ? courses[ courseSlug ] : [];
	}, shallowEqual );
	const [ userCourseProgression, setUserCourseProgression ] = useState( [] );
	useEffect( () => {
		setUserCourseProgression( initialUserCourseProgression );
	}, [ initialUserCourseProgression ] );

	const completedVideoCount = Object.keys( userCourseProgression ).length;
	const courseChapterCount = course ? Object.keys( course.videos ).length : 0;
	const isCourseComplete = completedVideoCount > 0 && courseChapterCount === completedVideoCount;

	const [ selectedChapterIndex, setSelectedChapterIndex ] = useState( 0 );
	const [ currentVideoKey, setCurrentVideoKey ] = useState( null );
	const [ isPlaying, setIsPlaying ] = useState( false );
	const currentVideo = currentVideoKey ? course?.videos[ currentVideoKey ] : course?.videos[ 0 ];

	const onVideoPlayClick = ( videoSlug ) => {
		recordTracksEvent( 'calypso_courses_play_click', {
			course: course.slug,
			video: videoSlug,
		} );

		setCurrentVideoKey( videoSlug );
		setIsPlaying( true );
	};

	useEffect( () => {
		if ( ! course || ! initialUserCourseProgression ) {
			return;
		}
		const videoSlugs = Object.keys( course?.videos ?? [] );
		const viewedSlugs = Object.keys( initialUserCourseProgression );
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
	}, [ course, initialUserCourseProgression ] );

	const isChapterSelected = ( idx ) => {
		return selectedChapterIndex === idx;
	};

	const onChapterSelected = ( idx ) => {
		if ( isChapterSelected( idx ) ) {
			return;
		}
		setSelectedChapterIndex( idx );
	};

	const markVideoCompleted = ( videoData ) => {
		const updatedUserCourseProgression = { ...userCourseProgression };
		updatedUserCourseProgression[ videoData.slug ] = true;
		setUserCourseProgression( updatedUserCourseProgression );
		updateUserCourseProgression( courseSlug, videoData.slug );
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
				{ course && cloneElement( headerBar, { course: course } ) }
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
							onVideoCompleted={ markVideoCompleted }
						/>
					) }
					<div className="videos-ui__chapters">
						{ course &&
							Object.entries( course?.videos ).map( ( data, i ) => {
								const isVideoCompleted =
									data[ 0 ] in userCourseProgression && userCourseProgression[ data[ 0 ] ];
								const videoInfo = data[ 1 ];

								return (
									<div
										key={ i }
										className={ `${ isChapterSelected( i ) ? 'selected ' : '' }videos-ui__chapter` }
									>
										<button
											type="button"
											className="videos-ui__chapter-accordion-toggle"
											onClick={ () => onChapterSelected( i ) }
										>
											<span className="videos-ui__video-title">
												{ i + 1 }. { videoInfo.title }{ ' ' }
											</span>
											<span className="videos-ui__duration"> { moment.unix( videoInfo.duration_seconds ).format('m:ss') } </span>{ ' ' }
											{ isVideoCompleted && (
												<span className="videos-ui__completed-checkmark">
													<Gridicon icon="checkmark" size={ 12 } />
												</span>
											) }
											{ isChapterSelected( i ) && ! isVideoCompleted && (
												<span className="videos-ui__status-icon">
													<Gridicon icon="chevron-up" size={ 18 } />
												</span>
											) }
											{ ! isChapterSelected( i ) && ! isVideoCompleted && (
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
			{ course &&
				cloneElement( footerBar, { course: course, isCourseComplete: isCourseComplete } ) }
		</div>
	);
};

export default VideosUi;
