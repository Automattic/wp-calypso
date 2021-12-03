import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import VideosUi from 'calypso/components/videos-ui';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import CoursesFooter from './footer';
import CoursesHeader from './header';
import './style.scss';

interface Props {
	stepName: string;
}

export default function CoursesStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { stepName } = props;

	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<StepWrapper
			className="courses"
			isFullLayout
			hideFormattedHeader
			stepContent={ <VideosUi headerBar={ <CoursesHeader /> } footerBar={ <CoursesFooter /> } /> }
			skipLabelText={ translate( 'Draft your first post' ) }
			skipButtonAlign="top"
			{ ...props }
		/>
	);
}
