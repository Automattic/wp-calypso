import {
	Button,
	CheckboxControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { useFileBrowserContext } from './file-browser-context';

interface FileBrowserHeaderProps {
	rewindId: number;
	siteId: number;
	siteSlug: string;
	hasCredentials?: boolean;
	isRestoreEnabled?: boolean;
	onTrackEvent?: ( eventName: string, properties?: Record< string, unknown > ) => void;
	onRequestGranularDownload?: (
		siteId: number,
		rewindId: number,
		includePaths: string,
		excludePaths: string
	) => void;
	onRequestGranularRestore: ( siteSlug: string, rewindId: number ) => void;
}

function FileBrowserHeader( {
	rewindId,
	siteId,
	siteSlug,
	hasCredentials,
	isRestoreEnabled,
	onTrackEvent,
	onRequestGranularDownload,
	onRequestGranularRestore,
}: FileBrowserHeaderProps ) {
	const { fileBrowserState } = useFileBrowserContext();
	const { getNode, getCheckList, setNodeCheckState } = fileBrowserState;
	const rootNode = getNode( '/' );
	const browserCheckList = getCheckList();

	const onDownloadClick = () => {
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		onRequestGranularDownload?.( siteId, rewindId, includePaths, excludePaths );
		onTrackEvent?.( 'calypso_jetpack_backup_browser_download_multiple_files' );
	};
	const onRestoreClick = () => {
		onRequestGranularRestore( siteSlug, rewindId );
		onTrackEvent?.( 'calypso_jetpack_backup_browser_restore_multiple_files', {
			...( hasCredentials !== undefined && { has_credentials: hasCredentials } ),
		} );
	};
	// A simple toggle.  Mixed will go to unchecked.
	const onCheckboxChange = () => {
		const newCheckState = rootNode && rootNode.checkState === 'unchecked' ? 'checked' : 'unchecked';
		setNodeCheckState( '/', newCheckState );
	};

	return (
		<VStack className="file-browser-header">
			{ browserCheckList.totalItems > 0 && (
				<ButtonStack justify="flex-start">
					<Button __next40pxDefaultSize onClick={ onDownloadClick }>
						{ __( 'Download selected files' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						onClick={ onRestoreClick }
						disabled={ ! isRestoreEnabled }
						variant="primary"
					>
						{ __( 'Restore selected files' ) }
					</Button>
				</ButtonStack>
			) }
			<HStack className="file-browser-header__selecting" justify="flex-start" spacing={ 0 }>
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ rootNode ? rootNode.checkState === 'checked' : false }
					indeterminate={ rootNode?.checkState === 'mixed' }
					onChange={ onCheckboxChange }
				/>
				<Text size="small">
					{ browserCheckList.totalItems } { __( 'files selected' ) }
				</Text>
			</HStack>
		</VStack>
	);
}

export default FileBrowserHeader;
