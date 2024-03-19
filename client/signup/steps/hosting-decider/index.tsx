import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { HostingFlowForkingPage } from './hosting-flow-forking-page';

export default function HostingDecider( props ) {
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
			stepContent={ <HostingFlowForkingPage /> }
			hideSkip
			{ ...props }
		/>
	);
}
