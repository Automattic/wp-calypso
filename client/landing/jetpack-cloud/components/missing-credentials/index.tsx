/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	settingsLink: string;
}

const JetpackBackupMissingCredentialsWarning: FunctionComponent< Props > = ( { settingsLink } ) => {
	const translate = useTranslate();

	return (
		<div>
			<img
				src="/calypso/images/jetpack/jetpack-connection-bad.svg"
				alt="jetpack cloud disconnect warning"
			/>
			<h4>{ translate( 'Restores not available. Missing server credentials.' ) }</h4>
			<p>
				{ translate(
					'Enter your server credentials to enable one-click restores from your backups.'
				) }
			</p>
			<Button href={ settingsLink }>{ translate( 'Enter server credentials' ) }</Button>
		</div>
	);
};

export default JetpackBackupMissingCredentialsWarning;
