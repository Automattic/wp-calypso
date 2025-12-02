import {
	CheckboxControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useFileBrowserContext } from './file-browser-context';

function FileBrowserHeader( { rewindId }: { rewindId: number } ) {
	const { fileBrowserState } = useFileBrowserContext();
	const { getNode, getCheckList, setNodeCheckState } = fileBrowserState;
	const rootNode = getNode( '/', rewindId );
	const browserCheckList = getCheckList( rewindId );

	// A simple toggle.  Mixed will go to unchecked.
	const onCheckboxChange = () => {
		const newCheckState = rootNode && rootNode.checkState === 'unchecked' ? 'checked' : 'unchecked';
		setNodeCheckState( '/', newCheckState, rewindId );
	};

	return (
		<VStack className="file-browser-header">
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
