/**
 * WordPress dependencies
 */

import { useEffect, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { serialize } from '@wordpress/blocks';

/** @typedef {import('../../index').OnSaveBlocks} OnSaveBlocks */
/** @typedef {import('../../index').OnSaveSerialized} OnSaveSerialized */

/**
 * Content saver
 * @param {object} props - Component props
 * @param {OnSaveBlocks} props.onSaveBlocks - Save blocks callback
 * @param {OnSaveSerialized} props.onSaveContent - Save content callback
 */
function ContentSaver( props ) {
	const { onSaveBlocks, onSaveContent } = props;
	const firstTime = useRef( true );
	const { setReady } = useDispatch( 'isolated/editor' );
	const { blocks, ignoredContent } = useSelect(
		( select ) => ( {
			blocks: select( 'isolated/editor' ).getBlocks(),
			ignoredContent: select( 'isolated/editor' ).getIgnoredContent(),
		} ),
		[]
	);

	useEffect( () => {
		if ( ! blocks ) {
			setReady( true );
			return;
		}

		// We don't want the onSave to trigger when we first load our content. It's not a major problem, but it adds complexity to the caller if it might trigger a remote save
		if ( firstTime.current ) {
			firstTime.current = false;
			setReady( true );
		} else {
			// Save the content in the format wanted by the user
			onSaveBlocks && onSaveBlocks( blocks, ignoredContent );
			onSaveContent && onSaveContent( serialize( blocks ) );
		}
	}, [ blocks ] );

	return null;
}

export default ContentSaver;
