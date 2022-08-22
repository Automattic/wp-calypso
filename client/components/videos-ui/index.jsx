import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import Notice from 'calypso/components/notice';
import {
	COURSE_SLUGS,
	useCourseData,
	useUpdateUserCourseProgressionMutation,
} from 'calypso/data/courses';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import VideoChapters from './video-chapters';
import VideoPlayer from './video-player';
import './style.scss';

const VideosUi = ( {
	courseSlug = COURSE_SLUGS.BLOGGING_QUICK_START,
	HeaderBar,
	FooterBar,
	areVideosTranslated = true,
	intent = undefined,
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
			...( intent ? { intent } : [] ),
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
				...( intent ? { intent } : [] ),
			} );
		}
	}, [ course ] );

	let headerTitle;
	let headerSubtitle;
	let headerSummary;

	switch ( courseSlug ) {
		case COURSE_SLUGS.BLOGGING_QUICK_START:
			headerTitle = translate( 'Watch five videos.' );
			headerSubtitle = translate( 'Save yourself hours.' );
			headerSummary = [
				translate( 'Learn the basics of blogging' ),
				translate( 'Familiarize yourself with WordPress' ),
				translate( 'Upskill and save hours' ),
				translate( 'Set yourself up for blogging success' ),
			];
			break;
		case COURSE_SLUGS.PAYMENTS_FEATURES:
			headerTitle = translate( 'Add Payments Features' );
			headerSubtitle = translate( 'Make Money on Your Website' );
			headerSummary = [
				translate( 'Making Money with Payments Features' ),
				translate( 'Premium Membership Blog' ),
				translate( 'Paid Subscription Newsletter' ),
				translate( 'Run a Crowdfunding Campaign' ),
			];
			break;
	}

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
						<h2>{ headerTitle ? headerTitle : translate( 'Watch five videos.' ) }</h2>
						<h2>{ headerSubtitle ? headerSubtitle : translate( 'Save yourself hours.' ) }</h2>
					</div>
					<div className="videos-ui__summary">
						<ul>
							{ headerSummary.map( ( text ) => {
								return (
									<li>
										<Gridicon icon="checkmark" size={ 18 } /> { text }
									</li>
								);
							} ) }
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
							intent={ intent }
							onVideoCompleted={ markVideoCompleted }
						/>
					) }
					<div className="videos-ui__chapters">
						{ course && (
							<VideoChapters
								course={ course }
								isChapterSelected={ isChapterSelected }
								onChapterSelected={ onChapterSelected }
								onVideoPlayClick={ onVideoPlayClick }
								translate={ translate }
								isPreloadAnimationState={ isPreloadAnimationState }
							/>
						) }
					</div>
				</div>
			</div>
			<FooterBar course={ course } isCourseComplete={ isCourseComplete } />
		</div>
	);
};

export default VideosUi;
