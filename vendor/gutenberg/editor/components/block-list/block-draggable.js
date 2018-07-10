/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Draggable } from '@wordpress/components';

function BlockDraggable( { rootUID, index, uid, layout, isDragging, ...props } ) {
	const className = classnames( 'editor-block-list__block-draggable', {
		'is-visible': isDragging,
	} );

	const transferData = {
		type: 'block',
		fromIndex: index,
		rootUID,
		uid,
		layout,
	};

	return (
		<Draggable className={ className } transferData={ transferData } { ...props }>
			<div className="editor-block-list__block-draggable-inner"></div>
		</Draggable>
	);
}

export default BlockDraggable;
