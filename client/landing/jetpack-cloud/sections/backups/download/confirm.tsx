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
	downloadSettings: RewindConfig;
	downloadTimestamp: string;
	onConfirm: () => void;
	onDownloadSettingsChange: ( config: RewindConfig ) => void;
}

const BackupDownloadConfirm: FunctionComponent< Props > = ( {
	downloadSettings,
	downloadTimestamp,
	onConfirm,
	onDownloadSettingsChange,
} ) => {
	const translate = useTranslate();
	const disableConfirmButton = Object.values( downloadSettings ).every( setting => ! setting );
	return (
		<div>
			<h3 className="download__title">{ translate( 'Create downloadable backup' ) }</h3>
			<p className="download__info">
				{ translate(
					'{{strong}}%(downloadTimestamp)s{{/strong}} is the selected point to create a download backup of.',
					{
						args: {
							downloadTimestamp,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<h4 className="download__cta">{ translate( 'Choose the items you wish to restore:' ) }</h4>
			<JetpackCloudRewindConfig
				currentConfig={ downloadSettings }
				onConfigChange={ onDownloadSettingsChange }
			/>
			<div className="download__confirm-notice">
				<Gridicon icon="notice-outline" />
				<p>{ translate( 'More info' ) }</p>
			</div>
			<Button
				className="download__primary-button"
				primary
				onClick={ onConfirm }
				disabled={ disableConfirmButton }
			>
				{ translate( 'Create downloadable file' ) }
			</Button>
		</div>
	);
};

export default BackupDownloadConfirm;
