import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import VideosUi from 'calypso/components/videos-ui';
import { COURSE_SLUGS, useCourseData } from 'calypso/data/courses';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CoursesFooter from './footer';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
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
	const { getIntent } = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] );

	return (
		<>
			<DocumentHead title={ translate( 'Watch Blogging videos' ) } />
			<StepContainer
				stepName="courses"
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
						HeaderBar={ () => null }
						FooterBar={ () => (
							<CoursesFooter
								isCourseComplete={ isCourseComplete }
								onStartWriting={ () => submit?.() }
							/>
						) }
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore - It's not recognizing the property as optional
						intent={ getIntent() }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default CoursesStep;
