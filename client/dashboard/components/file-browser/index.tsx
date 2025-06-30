import { VStack } from '@wordpress/components';
import { FileBrowserProvider } from './context';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';
import './style.scss';

interface FileBrowserProps {
	siteId: number;
	rewindId: number;
}

const FileBrowser = ( { siteId, rewindId }: FileBrowserProps ) => {
	const rootItem: FileBrowserItem = {
		name: '/',
		hasChildren: true,
		type: 'dir',
	};

	return (
		<FileBrowserProvider>
			<VStack spacing={ 0 }>
				<FileBrowserHeader siteId={ siteId } rewindId={ rewindId } />
				<FileBrowserNode
					siteId={ siteId }
					rewindId={ rewindId }
					item={ rootItem }
					path="/"
					isAlternate
				/>
			</VStack>
		</FileBrowserProvider>
	);
};

export default FileBrowser;
