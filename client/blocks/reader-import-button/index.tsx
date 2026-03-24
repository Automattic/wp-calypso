import { Button } from '@wordpress/components';
import { upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FilePicker from 'calypso/components/file-picker';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import './style.scss';

const noop = () => undefined;

type ReaderImportButtonProps = {
	onProgress?: () => void;
};

const ReaderImportButton: React.FC< ReaderImportButtonProps > = ( { onProgress = noop } ) => {
	const [ disabled, setDisabled ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		if ( disabled ) {
			event?.preventDefault();
		}
	};

	const onPick = ( files: File[] ) => {
		const file = files[ 0 ];
		if ( ! file ) {
			return;
		}

		const onImportSuccess = () => {
			const message = translate(
				"{{em}}%(name)s{{/em}} has been received. You'll get an email when your import is complete.",
				{
					args: { name: file.name },
					components: { em: <em /> },
				}
			);
			dispatch( successNotice( message ) );
		};

		const onImportFailure = ( error: Error ) => {
			const message = translate( 'Whoops, something went wrong. %(message)s Please try again.', {
				args: { message: error.message + '.' },
			} );
			dispatch( errorNotice( message ) );
		};

		const onImportFinished = ( err: Error | null ) => {
			setDisabled( false );

			if ( err ) {
				onImportFailure( err );
			} else {
				onImportSuccess();
			}
		};

		const req = wpcom.req.post(
			{
				path: '/read/following/mine/import',
				formData: [ [ 'import', file ] ],
			},
			{ apiVersion: '1.2' },
			null,
			onImportFinished
		);
		req.upload.onprogress = onProgress;
		setDisabled( true );
	};

	const importLabel = translate( 'Import OPML' );

	return (
		<Button className="reader-import-button" icon={ upload }>
			<FilePicker accept=".xml,.opml" onClick={ onClick } onPick={ onPick }>
				<span className="reader-import-button__label">{ importLabel }</span>
			</FilePicker>
		</Button>
	);
};

export default ReaderImportButton;
