import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import VideosUi from 'calypso/components/videos-ui';
import { useCourseData } from 'calypso/data/courses';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CoursesFooter from './footer';
import useCourseInfo from './use-course-info';
import type { Step } from '../../types';
import './style.scss';

/**
 * The courses step
 */
const CoursesStep: Step = function CoursesStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const isMobile = useViewportMatch( 'small', '<' );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const { courseSlug, congratsText, skipText, actionText } = useCourseInfo( intent );
	const { isCourseComplete } = useCourseData( courseSlug );
	const hideSkip = isMobile && isCourseComplete;

	return (
		<StepContainer
			stepName="courses"
			goBack={ goBack }
			goNext={ () => submit?.() }
			isFullLayout
			hideFormattedHeader
			skipLabelText={ skipText }
			nextLabelText={ actionText }
			hideSkip={ hideSkip }
			hideNext={ ! hideSkip }
			skipButtonAlign="top"
			stepContent={
				<VideosUi
					courseSlug={ courseSlug }
					areVideosTranslated={ false }
					HeaderBar={ () => null }
					FooterBar={ () => (
						<CoursesFooter
							description={ congratsText }
							actionText={ actionText }
							isCourseComplete={ isCourseComplete }
							onComplete={ () => submit?.() }
						/>
					) }
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore - It's not recognizing the property as optional
					intent={ intent }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default CoursesStep;
