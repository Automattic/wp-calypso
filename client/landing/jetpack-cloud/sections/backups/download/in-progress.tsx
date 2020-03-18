/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';

interface Props {
	longDownloadTimestamp: string;
	percent?: number;
}

const BackupDownloadInProgress: FunctionComponent< Props > = ( {
	longDownloadTimestamp,
	percent,
} ) => {
	const translate = useTranslate();
	return (
		<div>
			<h3>{ translate( 'Currently creating a downloadable backup of your site' ) }</h3>
			<ProgressBar value={ percent ? percent : 0 } total={ 100 } />
			<p>
				{ translate(
					"We're creating a downloadable backup of your site from {{strong}}%(longDownloadTimestamp)s{{/strong}}",
					{ args: { longDownloadTimestamp }, components: { strong: <strong /> } }
				) }
			</p>
			<h4>{ translate( 'Check your email' ) }</h4>
			<p>{ translate( "For your convenience, we'll email you when your file is ready." ) }</p>
		</div>
	);
};

export default BackupDownloadInProgress;
