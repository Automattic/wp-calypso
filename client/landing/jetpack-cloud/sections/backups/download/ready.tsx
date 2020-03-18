/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	downloadUrl?: string;
	longDownloadTimestamp: string;
}

const BackupDownloadReady: FunctionComponent< Props > = ( {
	downloadUrl,
	longDownloadTimestamp,
} ) => {
	const translate = useTranslate();
	return (
		<div>
			<h3>{ translate( 'Your backup is now available for download.' ) }</h3>
			<p>
				{ translate(
					'We successfully created a backup of your site from {{strong}}%(longDownloadTimestamp)s{{/strong}}.',
					{ args: { longDownloadTimestamp }, components: { strong: <strong /> } }
				) }
			</p>
			<Button href={ downloadUrl } primary>
				{ translate( 'Download file' ) }
			</Button>
			<h4>{ translate( 'Check your email' ) }</h4>
			<p>
				{ translate(
					"For your convenience, we've emailed you a link to your downloadable backup file."
				) }
			</p>
		</div>
	);
};

export default BackupDownloadReady;
