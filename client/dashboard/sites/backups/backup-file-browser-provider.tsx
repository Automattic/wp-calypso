import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { FileBrowserProvider } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { useLocale } from '../../app/locale';
import type { ReactNode } from 'react';

export function BackupFileBrowserProvider( { children }: { children: ReactNode } ) {
	const locale = useLocale();
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );

	const notices = {
		showError: ( message: string ) => createErrorNotice( message, { type: 'snackbar' } ),
		showSuccess: ( message: string ) => createSuccessNotice( message, { type: 'snackbar' } ),
	};

	return (
		<FileBrowserProvider locale={ locale } notices={ notices }>
			{ children }
		</FileBrowserProvider>
	);
}
