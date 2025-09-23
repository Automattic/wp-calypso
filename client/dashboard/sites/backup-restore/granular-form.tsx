import { siteBackupGranularRestoreMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack, Panel } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { rotateLeft } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useFileBrowserContext } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { siteBackupRestoreRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { Text } from '../../components/text';
import FileSectionPanelBody from './file-section-panel-body';

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

	const hasSelectedTables = browserSelectedList.some(
		( item ) =>
			item.type === 'table' ||
			// Also check if root path or /sql is selected as this includes all tables
			item.path === '/sql' ||
			item.path === '/'
	);

	const restoreWarning = hasSelectedTables
		? __(
				'This action will replace all settings, posts, pages and other site content with the information from the selected restore point.'
		  )
		: __(
				'This action will replace the selected content with the content from the selected restore point.'
		  );

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<Text>{ __( 'All the following selected items will be restored:' ) }</Text>
				<Panel>
					<FileSectionPanelBody type="theme" selectedItems={ browserSelectedList } />
					<FileSectionPanelBody type="plugin" selectedItems={ browserSelectedList } />
					<FileSectionPanelBody type="table" selectedItems={ browserSelectedList } />
					<FileSectionPanelBody type="file" selectedItems={ browserSelectedList } />
				</Panel>

				<Notice variant="info" title={ __( 'Important' ) }>
					{ restoreWarning }
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
