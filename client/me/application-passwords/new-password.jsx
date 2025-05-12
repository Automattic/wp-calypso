import { Button } from '@wordpress/components';
import { check, copy } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export default function NewAppPassword( { appName, newAppPassword, onClickDone } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ copyStatus, setCopyStatus ] = useState( '' );

	const handleCopyStatus = ( status ) => {
		setCopyStatus( status );
		setTimeout( () => {
			setCopyStatus( '' );
		}, 2000 );
	};

	const copyToClipboard = () => {
		navigator.clipboard
			.writeText( newAppPassword )
			.then( () => {
				handleCopyStatus( 'success' );
				dispatch(
					successNotice( translate( 'Application password copied to clipboard.' ), {
						duration: 2000,
					} )
				);
			} )
			.catch( () => {
				handleCopyStatus( 'error' );
				dispatch(
					errorNotice( translate( 'There was a problem copying the password.' ), {
						duration: 2000,
					} )
				);
			} );
	};

	return (
		<div className="application-passwords__new-password">
			<div className="application-passwords__new-password-display">
				<div className="application-passwords__new-password-content">{ newAppPassword }</div>
				<Button
					className="application-passwords__new-password-copy"
					icon={ 'success' === copyStatus ? check : copy }
					label={ 'success' === copyStatus ? translate( 'Copied!' ) : translate( 'Copy' ) }
					onClick={ copyToClipboard }
				/>
			</div>

			<p className="application-passwords__new-password-help">
				{ translate(
					'Use this password to log in to {{strong}}%(appName)s{{/strong}}. Note: spaces are ignored.',
					{
						args: { appName },
						components: { strong: <strong /> },
					}
				) }
			</p>

			<FormButtonsBar>
				<FormButton onClick={ onClickDone }>{ translate( 'Done' ) }</FormButton>
			</FormButtonsBar>
		</div>
	);
}
