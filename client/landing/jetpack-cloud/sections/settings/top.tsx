/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StepProgress from 'components/step-progress';
import { Card } from '@automattic/components';

interface Props {
	step: number;
}

const SettingsTopLevel: FunctionComponent< Props > = ( { children, step } ) => {
	const translate = useTranslate();

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
				{ children }
			</Card>
		</Main>
	);
};

export default SettingsTopLevel;
