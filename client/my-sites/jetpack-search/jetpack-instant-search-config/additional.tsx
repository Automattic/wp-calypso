/**
 * External dependencies
 */
import React, { ReactElement, Fragment } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormToggle from 'calypso/components/forms/form-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

export default function JetpackSearchInstantSearchAdditionalConfig(): ReactElement {
	return (
		<Fragment>
			<SettingsSectionHeader
				id="jetpack-search-additional-settings"
				showButton
				title={ translate( 'Additional Settings', { context: 'Settings header' } ) }
			/>
			<Card>
				<FormFieldset className="jetpack-instant-search-config__additional">
					<FormToggle checked>{ translate( 'Show sort selector.' ) }</FormToggle>
					<FormToggle checked>{ translate( 'Enable infinite scrolling.' ) }</FormToggle>
					<FormToggle checked>{ translate( 'Display "Powered by Jetpack".' ) }</FormToggle>
				</FormFieldset>
			</Card>
		</Fragment>
	);
}
