import { siteBackupGranularRestoreMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { rotateLeft } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useFileBrowserContext } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { siteBackupRestoreRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { Text } from '../../components/text';

function SiteBackupGranularRestoreForm( {
	siteId,
	onRestoreInitiate,
}: {
	siteId: number;
	onRestoreInitiate: ( restoreId: number ) => void;
} ) {
	const { rewindId } = siteBackupRestoreRoute.useParams();
	const { mutate: restoreMutation, isPending: isRestoreMutationPending } = useMutation(
		siteBackupGranularRestoreMutation( siteId )
	);
	const { createErrorNotice } = useDispatch( noticesStore );

	const { fileBrowserState } = useFileBrowserContext();
	const browserCheckList = fileBrowserState.getCheckList();
	const browserSelectedList = fileBrowserState.getSelectedList();

	const handleGranularRestore = () => {
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		restoreMutation(
			{
				timestamp: rewindId,
				config: {
					includePaths,
					excludePaths,
				},
			},
			{
				onSuccess: ( restoreId ) => {
					onRestoreInitiate( restoreId );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to initiate restore. Please try again.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		handleGranularRestore();
	};

	const renderSelectedFiles = () => {
		const fileDisplayLimit = 8;
		const displayFiles = browserSelectedList.slice( 0, fileDisplayLimit );
		const remainingCount = browserSelectedList.length - fileDisplayLimit;

		return (
			<VStack spacing={ 0 }>
				<Text>{ __( 'Files and directories that will be restored:' ) }</Text>
				<ul>
					{ displayFiles.map( ( file ) => (
						<li key={ file.path }>{ file.path }</li>
					) ) }
				</ul>
				{ remainingCount > 0 && (
					<Text>
						{ sprintf(
							/* translators: %d is the number of additional files */
							__( '%d more file or directory selected' ),
							remainingCount
						) }
					</Text>
				) }
			</VStack>
		);
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				{ renderSelectedFiles() }

				<Notice variant="info" title={ __( 'Important' ) }>
					{ __(
						'This action will replace all settings, posts, pages and other site content with the information from the selected restore point.'
					) }
				</Notice>

				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						icon={ rotateLeft }
						type="submit"
						isBusy={ isRestoreMutationPending }
						disabled={ isRestoreMutationPending }
					>
						{ __( 'Restore selected files' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}

export default SiteBackupGranularRestoreForm;
