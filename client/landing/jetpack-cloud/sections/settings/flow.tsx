/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StepProgress from 'components/step-progress';

const SettingsFlow: FunctionComponent = () => {
	const translate = useTranslate();
	const [ step ] = useState( 0 );

	const steps = [
		translate( 'Host locator' ),
		translate( 'Credentials' ),
		translate( 'Verification' ),
	];

	return (
		<Main className="settings">
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<Card>
				<StepProgress currentStep={ step } steps={ steps } />
			</Card>
		</Main>
	);
};

export default SettingsFlow;
