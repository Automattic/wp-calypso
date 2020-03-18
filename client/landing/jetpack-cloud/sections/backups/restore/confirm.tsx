/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { RewindConfig } from 'landing/jetpack-cloud/components/rewind-config/types';
import Gridicon from 'components/gridicon';
import JetpackCloudRewindConfig from 'landing/jetpack-cloud/components/rewind-config';

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

	const disableConfirmButton = Object.values( restoreSettings ).every( setting => ! setting );

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
			<div className="restore__confirm-warning">
				<Gridicon icon="notice" />
				<p>{ translate( 'This will override and remove all content after this point' ) }</p>
			</div>
			<Button
				className="restore__primary-button"
				disabled={ disableConfirmButton }
				onClick={ onConfirm }
				primary
			>
				{ 'Confirm Restore' }
			</Button>
		</div>
	);
};

export default BackupRestoreConfirm;
