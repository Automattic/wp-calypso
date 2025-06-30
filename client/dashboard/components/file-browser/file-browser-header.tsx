import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { useFileBrowser } from './context';

interface FileBrowserHeaderProps {
	siteId: number;
	rewindId: number;
}

const FileBrowserHeader = ( { siteId, rewindId }: FileBrowserHeaderProps ) => {
	const { state } = useFileBrowser();

	const selectedNodes = Object.values( state.nodes ).filter(
		( node ) => node.checkState === 'checked'
	);

	const handleDownload = () => {
		// Implementation for download functionality would go here
		console.log( 'Download selected files:', selectedNodes );
	};

	return (
		<div className="file-browser-header">
			<div className="file-browser-header__info">
				{ selectedNodes.length > 0 && (
					<span>
						{ __( '%d items selected', 'calypso' ).replace(
							'%d',
							selectedNodes.length.toString()
						) }
					</span>
				) }
			</div>
			<div className="file-browser-header__actions">
				<Button
					variant="primary"
					icon={ download }
					disabled={ selectedNodes.length === 0 }
					onClick={ handleDownload }
				>
					{ __( 'Download selected', 'calypso' ) }
				</Button>
			</div>
		</div>
	);
};

export default FileBrowserHeader;
