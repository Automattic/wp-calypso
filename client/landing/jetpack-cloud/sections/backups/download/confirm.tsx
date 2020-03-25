/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	downloadTimestamp: string;
	onConfirm: () => void;
}

const BackupDownloadConfirm: FunctionComponent< Props > = ( { downloadTimestamp, onConfirm } ) => {
	const translate = useTranslate();
	return (
		<div>
			<h3>{ translate( 'Create downloadable backup' ) }</h3>
			<p>
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
			<Button primary onClick={ onConfirm }>
				{ translate( 'Create downloadable file' ) }
			</Button>
		</div>
	);
};

export default BackupDownloadConfirm;
