import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import VideosUi from 'calypso/components/videos-ui';
import { COURSE_SLUGS, useCourseData } from 'calypso/data/courses';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CoursesFooter from './footer';
import CoursesHeader from './header';
import type { Step } from '../../types';
import './style.scss';

/**
 * The courses step
 */
const CoursesStep: Step = function CoursesStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const isMobile = useViewportMatch( 'small', '<' );
	const courseSlug = COURSE_SLUGS.BLOGGING_QUICK_START;
	const { isCourseComplete } = useCourseData( courseSlug );
	const hideSkip = isMobile && isCourseComplete;

	return (
		<StepContainer
			stepName={ 'courses' }
			goBack={ goBack }
			goNext={ () => submit?.() }
			isFullLayout
			hideFormattedHeader
			skipLabelText={ translate( 'Draft your first post' ) }
			nextLabelText={ translate( 'Start writing' ) }
			hideSkip={ hideSkip }
			hideNext={ ! hideSkip }
			skipButtonAlign="top"
			stepContent={
				<VideosUi
					courseSlug={ courseSlug }
					areVideosTranslated={ false }
					HeaderBar={ CoursesHeader }
					FooterBar={ () => (
						<CoursesFooter
							isCourseComplete={ isCourseComplete }
							onStartWriting={ () => submit?.() }
						/>
					) }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default CoursesStep;
