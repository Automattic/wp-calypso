import config from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Notice from 'calypso/components/notice';
import {
	COURSE_SLUGS,
	useCourseData,
	useUpdateUserCourseProgressionMutation,
} from 'calypso/data/courses';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import VideoPlayer from './video-player';
import './style.scss';

const VideosUi = ( {
	courseSlug = COURSE_SLUGS.BLOGGING_QUICK_START,
	HeaderBar,
	FooterBar,
	areVideosTranslated = true,
} ) => {
	const translate = useTranslate();
	const isEnglish = config( 'english_locales' ).includes( translate.localeSlug );
	const { course, videoSlugs, completedVideoSlugs, isCourseComplete } = useCourseData( courseSlug );
	const { updateUserCourseProgression } = useUpdateUserCourseProgressionMutation();

	const [ shouldShowVideoTranslationNotice, setShouldShowVideoTranslationNotice ] = useState(
		! isEnglish && ! areVideosTranslated
	);

	const [ selectedChapterIndex, setSelectedChapterIndex ] = useState( 0 );
	const [ isPreloadAnimationState, setisPreloadAnimationState ] = useState( true );
	const [ currentVideoKey, setCurrentVideoKey ] = useState( null );
	const [ isPlaying, setIsPlaying ] = useState( false );
	const currentVideo = course?.videos?.[ currentVideoKey || 0 ];

	const onVideoPlayClick = ( videoSlug ) => {
		recordTracksEvent( 'calypso_courses_play_click', {
			course: course.slug,
			video: videoSlug,
		} );

		setCurrentVideoKey( videoSlug );
		setIsPlaying( true );
	};

	// Find the initial video slug which is not completed if the currentVideoKey is never set.
	// If all of the video slug are completed, the default is first one.
	useEffect( () => {
		if ( ! course || ! videoSlugs || ! completedVideoSlugs || currentVideoKey ) {
			return;
		}

		const nextSlug = completedVideoSlugs.length
			? videoSlugs.find( ( slug ) => ! completedVideoSlugs.includes( slug ) )
			: null;

		const initialVideoSlug = nextSlug || videoSlugs[ 0 ];

		setCurrentVideoKey( initialVideoSlug );
		setSelectedChapterIndex( videoSlugs.indexOf( initialVideoSlug ) );
		setisPreloadAnimationState( false );
	}, [ course, videoSlugs, completedVideoSlugs, currentVideoKey ] );

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
		if ( ! completedVideoSlugs.includes( videoData.slug ) ) {
			updateUserCourseProgression( courseSlug, videoData.slug );
		}
	};

	const onVideoTranslationSupportLinkClick = () => {
		recordTracksEvent( 'calypso_courses_translation_support_link_click', {
			course: course.slug,
		} );
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
				<HeaderBar course={ course } />

				{ currentVideo && shouldShowVideoTranslationNotice && (
					<Notice onDismissClick={ () => setShouldShowVideoTranslationNotice( false ) }>
						{ translate(
							'These videos are currently only available in English. Please {{supportLink}}let us know{{/supportLink}} if you would like them translated.',
							{
								components: {
									supportLink: (
										<a href="/help/contact" onClick={ onVideoTranslationSupportLinkClick } />
									),
								},
							}
						) }
					</Notice>
				) }
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
			<div
				className={ classNames( 'videos-ui__body', {
					'is-loading': ! course,
				} ) }
			>
				<div className="videos-ui__body-title">
					<h3>{ course && course.title }</h3>
				</div>
				<div className="videos-ui__video-content">
					{ ! currentVideo && <div className="videos-ui__video-placeholder" /> }
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
									data[ 0 ] in course.completions && course.completions[ data[ 0 ] ];
								const videoInfo = data[ 1 ];

								return (
									<div
										key={ i }
										className={ classNames( 'videos-ui__chapter', {
											selected: isChapterSelected( i ),
											preload: isPreloadAnimationState,
										} ) }
									>
										<button
											type="button"
											className="videos-ui__chapter-accordion-toggle"
											onClick={ () => onChapterSelected( i ) }
										>
											<span className="videos-ui__video-title">
												{ i + 1 }. { videoInfo.title }{ ' ' }
											</span>
											<span className="videos-ui__duration">
												{ moment.unix( videoInfo.duration_seconds ).format( 'm:ss' ) }
											</span>
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
			<FooterBar course={ course } isCourseComplete={ isCourseComplete } />
		</div>
	);
};

export default VideosUi;
