/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StepProgress from 'components/step-progress';

/**
 * Internal dependencies
 */
import './style.scss';

<<<<<<< HEAD:client/landing/jetpack-cloud/sections/settings/top/index.tsx
interface Props {
	step: number;
}

const SettingsTopLevel: FunctionComponent< Props > = ( { children, step } ) => {
=======
const SettingsFlow: FunctionComponent = () => {
>>>>>>> add message:client/landing/jetpack-cloud/sections/settings/settings-flow/index.tsx
	const translate = useTranslate();

	const steps = [
		translate( 'Host locator' ),
		translate( 'Credentials' ),
		translate( 'Verification' ),
	];

	return (
<<<<<<< HEAD:client/landing/jetpack-cloud/sections/settings/top/index.tsx
		<Main className="top">
=======
		<Main className="settings-flow">
>>>>>>> add message:client/landing/jetpack-cloud/sections/settings/settings-flow/index.tsx
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<Card>
				<StepProgress currentStep={ step } steps={ steps } />
<<<<<<< HEAD:client/landing/jetpack-cloud/sections/settings/top/index.tsx
				{ children }
=======
				<div className="settings-flow__notice">
					{ translate(
						'In order to restore your site, should something go wrong, you’ll need to provide your websites {{strong}}SSH{{/strong}}, {{strong}}SFTP{{/strong}} or {{strong}}FTP{{/strong}} server credentials. We’ll guide you through it:',
						{
							components: { strong: <strong /> },
						}
					) }
				</div>
				<h3>{ translate( 'Select your website host for example.com' ) }</h3>
				<p>{ translate( 'It looks like your host is SiteGround' ) }</p>
>>>>>>> add message:client/landing/jetpack-cloud/sections/settings/settings-flow/index.tsx
			</Card>
		</Main>
	);
};

export default SettingsTopLevel;
