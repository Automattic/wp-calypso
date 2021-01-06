/**
 * External dependencies
 */
import React, { FC, useState, useMemo } from 'react';
import {
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
	BlockList,
	ObserveTyping,
	WritingFlow,
} from '@wordpress/block-editor';
import { FullscreenMode, InterfaceSkeleton } from '@wordpress/interface';
import type { BlockInstance } from '@wordpress/blocks';
import {
	Popover,
	DropZoneProvider,
	SlotFillProvider,
	FocusReturnProvider,
} from '@wordpress/components';
import { uploadMedia } from '@wordpress/media-utils';

/**
 * Internal dependencies
 */
import Notices from '../loe-notices';
import './styles.scss';

type Settings = NonNullable< BlockEditorProvider.Props[ 'settings' ] >;

interface Props {
	settings: Settings;
}

const Editor: FC< Props > = ( { settings: _settings } ) => {
	const settings = useMemo(
		(): Settings => ( {
			..._settings,
			mediaUpload( { onError, ...rest } ) {
				uploadMedia( {
					wpAllowedMimeTypes: _settings.allowedMimeTypes,
					onError: ( { message } ) => onError( message ),
					...rest,
				} );
			},
		} ),
		[ _settings ]
	);

	const [ blocks, setBlocks ] = useState< BlockInstance[] >( [] );

	// Wrapper for updating blocks. Required as `onInput` callback passed to
	// `BlockEditorProvider` is called with more than 1 argument. Therefore
	// attempting to setState directly via `setBlocks` will trigger an error
	// in React.
	const handleSetBlocks = ( blocks: BlockInstance[] ) => setBlocks( blocks );

	return (
		<>
			<FullscreenMode isActive={ true } />
			<SlotFillProvider>
				<DropZoneProvider>
					<FocusReturnProvider>
						<InterfaceSkeleton
							content={
								<>
									<Notices />
									<div className="loe-editor__wrapper">
										<BlockEditorProvider
											value={ blocks }
											onInput={ handleSetBlocks }
											settings={ settings }
										>
											<BlockEditorKeyboardShortcuts />
											<WritingFlow>
												<ObserveTyping>
													<BlockList className="loe-editor__block-list" />
												</ObserveTyping>
											</WritingFlow>
										</BlockEditorProvider>
									</div>
								</>
							}
						/>
						<Popover.Slot />
					</FocusReturnProvider>
				</DropZoneProvider>
			</SlotFillProvider>
		</>
	);
};

export default Editor;
