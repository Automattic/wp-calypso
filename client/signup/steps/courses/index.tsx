import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import VideosUi from 'calypso/components/videos-ui';
import { COURSE_SLUGS, useCourseData } from 'calypso/data/courses';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import CoursesFooter from './footer';
import CoursesHeader from './header';
import './style.scss';

interface Props {
	stepName: string;
	goToNextStep: () => void;
}

export default function CoursesStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { stepName, goToNextStep } = props;
	const isMobile = useViewportMatch( 'small', '<' );
	const courseSlug = COURSE_SLUGS.BLOGGING_QUICK_START;
	const { isCourseComplete } = useCourseData( courseSlug );
	const hideSkip = isMobile && isCourseComplete;

	const onStartWriting = () => {
		dispatch( submitSignupStep( { stepName } ) );
		goToNextStep();
	};

	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<StepWrapper
			className="courses"
			isFullLayout
			hideFormattedHeader
			stepContent={
				<VideosUi
					courseSlug={ courseSlug }
					areVideosTranslated={ false }
					HeaderBar={ CoursesHeader }
					FooterBar={ () => (
						<CoursesFooter
							isCourseComplete={ isCourseComplete }
							onStartWriting={ onStartWriting }
						/>
					) }
				/>
			}
			hideSkip={ hideSkip }
			hideNext={ ! hideSkip }
			skipLabelText={ translate( 'Draft your first post' ) }
			skipButtonAlign="top"
			nextLabelText={ translate( 'Start writing' ) }
			{ ...props }
		/>
	);
}
