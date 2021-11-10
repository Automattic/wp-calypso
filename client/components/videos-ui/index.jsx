import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useRef } from 'react';
import useCourseQuery from 'calypso/data/courses/use-course-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import VideoLinksBar from './video-links-bar';
import VideoPlayer from './video-player';
import './style.scss';

const VideosUi = ( { shouldDisplayTopLinks = false, onBackClick = () => {} } ) => {
	const translate = useTranslate();
	const { data: course } = useCourseQuery( 'blogging-quick-start', { retry: false } );
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
		if ( ! currentVideoKey && course ) {
			// @TODO add logic to pick the first unseen video
			const initialVideoId = 'find-theme';
			setCurrentVideoKey( initialVideoId );
		}
	}, [ currentVideoKey, course ] );

	useEffect( () => {
		if ( currentVideoKey && course ) {
			setCurrentVideo( course.videos[ currentVideoKey ] );
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

	const skipClickHandler = () =>
		recordTracksEvent( 'calypso_courses_skip_to_draft', {
			course: course.slug,
		} );

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
				<VideoLinksBar
					displayIcon={ true }
					displayLinks={ shouldDisplayTopLinks }
					isFooter={ false }
					onBackClick={ onBackClick }
					skipClickHandler={ skipClickHandler }
				/>
				<div className="videos-ui__header-content">
					<div className="videos-ui__titles">
						<h2>{ translate( 'Watch five videos.' ) }</h2>
						<h2>{ translate( 'Save yourself hours.' ) }</h2>
					</div>
					<div className="videos-ui__summary">
						<ul>
							<li>
								<Gridicon icon="checkmark" size={ 12 } />{ ' ' }
								{ translate( 'Learn the basics of blogging' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 12 } />{ ' ' }
								{ translate( 'Familiarize yourself with WordPress' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 12 } /> { translate( 'Upskill and save hours' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 12 } />{ ' ' }
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
						/>
					) }
					<div className="videos-ui__chapters">
						{ course &&
							Object.entries( course.videos ).map( ( data, i ) => {
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
											{ /* to be restored when completion functionality is implmented */ }
											{ /* <span className="videos-ui__completed">
											<Gridicon icon="checkmark" size={ 12 } />
										</span> */ }
											{ isVideoSelected( i ) && (
												<span className="videos-ui__status-icon">
													<Gridicon icon="chevron-up" size={ 18 } />
												</span>
											) }
											{ ! isVideoSelected( i ) && (
												<span className="videos-ui__status-icon">
													<Gridicon icon="chevron-down" size={ 18 } />
												</span>
											) }
											{ i + 1 }. { videoInfo.title }{ ' ' }
											<span className="videos-ui__duration"> { videoInfo.duration } </span>{ ' ' }
										</button>
										<div className="videos-ui__active-video-content">
											<div>
												<p>{ videoInfo.description } </p>
												<Button
													className="videos-ui__play-button"
													onClick={ () => onVideoPlayClick( data[ 0 ], videoInfo ) }
												>
													<Gridicon icon="play" />
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
			<VideoLinksBar
				displayIcon={ false }
				displayLinks={ shouldDisplayTopLinks }
				isFooter={ true }
				onBackClick={ onBackClick }
				skipClickHandler={ skipClickHandler }
			/>
		</div>
	);
};

export default VideosUi;
