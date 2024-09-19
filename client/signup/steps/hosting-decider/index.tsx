import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { HostingFlowForkingPage } from './hosting-flow-forking-page';
export type StepProps = {
	stepSectionName: string | null;
	stepName: string;
	flowName: string;
	goToStep: () => void;
	goToNextStep: () => void;
	submitSignupStep: ( step: any, dependencies: any ) => void;
};

export default function HostingDecider( props: StepProps ) {
	const translate = useTranslate();
	const siteCount = useSelector( getCurrentUserSiteCount );
	const headerText =
		siteCount === 0 ? translate( 'Let’s add your first site' ) : translate( 'Let’s add a site' );
	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText=""
			fallbackSubHeaderText=""
			stepContent={ <HostingFlowForkingPage { ...props } /> }
			hideSkip
			{ ...props }
		/>
	);
}
