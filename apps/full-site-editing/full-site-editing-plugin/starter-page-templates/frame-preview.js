/**
 * External dependencies
 */
import { castArray, map, keyBy, get } from 'lodash';

/**
 * WordPress dependencies
 */

import domReady from '@wordpress/dom-ready';
import { Modal } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { parse as parseBlocks } from '@wordpress/blocks';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import {
	useRef,
	useMemo,
	useEffect,
	useState,
	useReducer,
	useLayoutEffect,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import replacePlaceholders from './page-template-modal/utils/replace-placeholders';

const { templates = [], siteInformation = {} } = window.starterPageTemplatesConfig;

domReady( () => {
	setTimeout( () => {
		window.templatesBySlug = keyBy(
			map( templates, ( { content, slug, title } ) => ( {
				slug,
				title,
				blocks: content ? parseBlocks( replacePlaceholders( content, siteInformation ) ) : [],
				content,
			} ) ),
			'slug'
		);
	}, 0 );
} );

const getBlocksByTemplateSlug = slug => {
	if ( ! window.templatesBySlug || ! window.templatesBySlug[ slug ] ) {
		return [];
	}
	return templatesBySlug[ slug ].blocks || [];
};

const FramePreview = ( { settings, initTemplate } ) => {
	const renderedBlocksRef = useRef();

	// const templates = useMemo( parseTemplates, [] );

	// Getting template slug from parent post message.
	const [ slug, setSlug ] = useState( initTemplate );
	const receiveMessage = ( { data: slug } ) => {
		if ( ! templatesBySlug || ! templatesBySlug[ slug ] ) {
			return;
		}
		setSlug( slug );
	};

	// Listening parent messages.
	useEffect( () => {
		window.addEventListener( 'message', receiveMessage, false );

		return () => {
			window.removeEventListener( 'message', receiveMessage, false );
		};
	}, [] );

	const blocks = useMemo( () => castArray( getBlocksByTemplateSlug( slug ) ), [ slug ] );
	const [ recomputeBlockListKey, triggerRecomputeBlockList ] = useReducer( state => state + 1, 0 );
	useLayoutEffect( triggerRecomputeBlockList, [ slug ] );

	return (
		<Modal
			className="template-frame-preview-modal"
			overlayClassName="template-frame-preview-modal-screen-overlay"
			shouldCloseOnClickOutside={ false }
			// Using both variants here to be compatible with new Gutenberg and old (older than 6.6).
			isDismissable={ false }
			isDismissible={ false }
		>
			<div ref={ renderedBlocksRef } className="block-editor frame-template-preview">
				<div className="edit-post-visual-editor">
					<div className="editor-styles-wrapper">
						<div className="editor-writing-flow">
							<BlockEditorProvider value={ blocks } settings={ settings }>
								<div key={ recomputeBlockListKey }>
									<BlockList />
								</div>
							</BlockEditorProvider>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default withSelect( select => {
	return {
		settings: select( 'core/block-editor' ).getSettings(),
	};
} )( FramePreview );
