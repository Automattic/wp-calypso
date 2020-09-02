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

/**
 * Internal dependencies
 */
import './style.scss';

const SettingsFlow: FunctionComponent = () => {
	const translate = useTranslate();
	const [ step ] = useState( 0 );

	const steps = [
		translate( 'Host locator' ),
		translate( 'Credentials' ),
		translate( 'Verification' ),
	];

	return (
		<Main className="settings-flow">
			<DocumentHead title={ translate( 'Settings' ) } />
			<SidebarNavigation />
			<Card>
				<StepProgress currentStep={ step } steps={ steps } />
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
			</Card>
		</Main>
	);
};

export default SettingsFlow;
