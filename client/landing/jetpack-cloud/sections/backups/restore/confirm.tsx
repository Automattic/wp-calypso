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
	onRestoreSettingsChange,
	restoreSettings,
	restoreTimestamp,
	siteTitle,
} ) => {
	const translate = useTranslate();

	return (
		<div>
			<h3 className="restore__title">
				{ siteTitle
					? translate( 'Restore site %(siteTitle)s', { args: { siteTitle } } )
					: translate( 'Restore site' ) }
			</h3>
			<p className="restore__info">
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
			<h4 className="restore__cta">{ translate( 'Choose the items you wish to restore:' ) }</h4>
			<JetpackCloudRewindConfig
				currentConfig={ restoreSettings }
				onConfigChange={ onRestoreSettingsChange }
			/>
			<Button className="restore__primary-button" primary onClick={ onConfirm }>
				{ 'Confirm Restore' }
			</Button>
		</div>
	);
};

export default BackupRestoreConfirm;
