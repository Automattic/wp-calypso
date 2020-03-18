/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import JetpackCloudRewindConfig from 'landing/jetpack-cloud/components/rewind-config';
import { RewindConfig } from 'landing/jetpack-cloud/components/rewind-config/types';

interface Props {
	onConfirm: () => void;
	siteTitle: string | null;
	restoreTimestamp: string;
	restoreSettings: RewindConfig;
	onRestoreSettingsChange: ( config: RewindConfig ) => void;
}

const BackupRestoreConfirm: FunctionComponent< Props > = ( {
	onConfirm,
	restoreSettings,
	onRestoreSettingsChange,
	restoreTimestamp,
} ) => {
	const translate = useTranslate();

	return (
		<div>
			<h3>{ translate( 'Restore site' ) }</h3>
			<p>
				{ translate(
					'{{strong}}%(restoreTimestamp)s{{/strong}} is the selected point for your restore',
					{
						args: {
							restoreTimestamp,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<h4>{ translate( 'Choose the items you wish to restore:' ) }</h4>
			<JetpackCloudRewindConfig
				currentConfig={ restoreSettings }
				onConfigChange={ onRestoreSettingsChange }
			/>
			<Button primary onClick={ onConfirm }>
				{ 'Confirm Restore' }
			</Button>
		</div>
	);
};

export default BackupRestoreConfirm;
