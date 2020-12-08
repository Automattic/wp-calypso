/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import ServerCredentialsForm from 'calypso/components/jetpack/server-credentials-form';

const Form: FunctionComponent = () => {
	const translate = useTranslate();

	return (
		<div className="credentials__form">
			<h1>{ translate( 'Provide your SSH, SFTP or FTP server credentials' ) }</h1>
			<ServerCredentialsForm />
		</div>
	);
};

export default Form;
