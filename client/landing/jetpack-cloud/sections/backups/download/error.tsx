/**
 * External dependencies
 */
import React from 'react';

interface Props {
	error?: string;
	siteTitle: string | null;
}

const BackupDownloadError = ( { error, siteTitle }: Props ) => (
	<div>
		<h3>{ 'An error has occurred' }</h3>
		<p>
			{ `An error occurred while creating a download backup of ${
				siteTitle ? siteTitle : 'your site'
			}.` }
			{ error && `The error was: ${ error }` }
		</p>
	</div>
);

export default BackupDownloadError;
