/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import ServerCredentialsForm from 'components/jetpack/server-credentials-form';

const Form: FunctionComponent = () => {
	const translate = useTranslate();

	return (
		<div className="credentials__form">
			<h1>{ translate( 'Provide your SSH, SFTP or FTP server credentials' ) }</h1>
			<ServerCredentialsForm
				support={ {
					host:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus blandit, odio in ultrices dapibus, lacus mauris convallis nibh, quis feugiat justo leo ut ex. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eget condimentum magna.',
					protocol:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus blandit, odio in ultrices dapibus, lacus mauris convallis nibh, quis feugiat justo leo ut ex. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eget condimentum magna.',
				} }
			/>
		</div>
	);
};

export default Form;
