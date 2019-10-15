/**
 * External dependencies
 */
import memize from 'memize';
import { size, map, without } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect, withDispatch } from '@wordpress/data';
import { EditorProvider, ErrorBoundary, PostLockedModal } from '@wordpress/editor';
import { StrictMode, Component } from '@wordpress/element';
import { KeyboardShortcuts, SlotFillProvider, DropZoneProvider } from '@wordpress/components';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import preventEventDiscovery from '@wordpress/edit-post/build-module/prevent-event-discovery';
import Layout from '@wordpress/edit-post/build-module/components/layout';
import EditorInitialization from '@wordpress/edit-post/build-module/components/editor-initialization';
import EditPostSettings from '@wordpress/edit-post/build-module/components/edit-post-settings';

class Editor extends Component {
	constructor() {
		super( ...arguments );

		this.getEditorSettings = memize( this.getEditorSettings, {
			maxSize: 1,
		} );
	}

	getEditorSettings(
		settings,
		hasFixedToolbar,
		showInserterHelpPanel,
		focusMode,
		hiddenBlockTypes,
		blockTypes,
		preferredStyleVariations,
		__experimentalLocalAutosaveInterval,
		updatePreferredStyleVariations
	) {
		settings = {
			...settings,
			__experimentalPreferredStyleVariations: {
				value: preferredStyleVariations,
				onChange: updatePreferredStyleVariations,
			},
			hasFixedToolbar,
			focusMode,
			showInserterHelpPanel,
			__experimentalLocalAutosaveInterval,
		};

		// Omit hidden block types if exists and non-empty.
		if ( size( hiddenBlockTypes ) > 0 ) {
			// Defer to passed setting for `allowedBlockTypes` if provided as
			// anything other than `true` (where `true` is equivalent to allow
			// all block types).
			const defaultAllowedBlockTypes =
				true === settings.allowedBlockTypes
					? map( blockTypes, 'name' )
					: settings.allowedBlockTypes || [];

			settings.allowedBlockTypes = without( defaultAllowedBlockTypes, ...hiddenBlockTypes );
		}

		return settings;
	}

	render() {
		const {
			settings,
			hasFixedToolbar,
			focusMode,
			post,
			postId,
			initialEdits,
			onError,
			hiddenBlockTypes,
			blockTypes,
			preferredStyleVariations,
			__experimentalLocalAutosaveInterval,
			showInserterHelpPanel,
			updatePreferredStyleVariations,
			...props
		} = this.props;

		if ( ! post ) {
			return null;
		}

		const editorSettings = this.getEditorSettings(
			settings,
			hasFixedToolbar,
			showInserterHelpPanel,
			focusMode,
			hiddenBlockTypes,
			blockTypes,
			preferredStyleVariations,
			__experimentalLocalAutosaveInterval,
			updatePreferredStyleVariations
		);

		return (
			<StrictMode>
				<EditPostSettings.Provider value={ settings }>
					<SlotFillProvider>
						<DropZoneProvider>
							<EditorProvider
								settings={ editorSettings }
								post={ post }
								initialEdits={ initialEdits }
								useSubRegistry={ false }
								{ ...props }
							>
								<ErrorBoundary onError={ onError }>
									<EditorInitialization postId={ postId } />
									<Layout />
									<KeyboardShortcuts shortcuts={ preventEventDiscovery } />
								</ErrorBoundary>
								<PostLockedModal />
							</EditorProvider>
						</DropZoneProvider>
					</SlotFillProvider>
				</EditPostSettings.Provider>
			</StrictMode>
		);
	}
}

export default compose( [
	withSelect( ( select, { postId, postType } ) => {
		const { isFeatureActive, getPreference } = select( 'core/edit-post' );
		const { getEntityRecord } = select( 'core' );
		const { getBlockTypes } = select( 'core/blocks' );

		return {
			showInserterHelpPanel: isFeatureActive( 'showInserterHelpPanel' ),
			hasFixedToolbar: isFeatureActive( 'fixedToolbar' ),
			focusMode: isFeatureActive( 'focusMode' ),
			post: getEntityRecord( 'postType', postType, postId ),
			preferredStyleVariations: getPreference( 'preferredStyleVariations' ),
			hiddenBlockTypes: getPreference( 'hiddenBlockTypes' ),
			blockTypes: getBlockTypes(),
			__experimentalLocalAutosaveInterval: getPreference( 'localAutosaveInterval' ),
		};
	} ),
	withDispatch( dispatch => {
		const { updatePreferredStyleVariations } = dispatch( 'core/edit-post' );
		return {
			updatePreferredStyleVariations,
		};
	} ),
] )( Editor );
