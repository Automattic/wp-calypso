import { DndContext, useDraggable } from '@dnd-kit/core';

interface ResizeHandleProps {
	disabled?: boolean;
}

function ResizeHandle( { disabled = false }: ResizeHandleProps ) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable( {
		id: 'draggable',
	} );

	const resizeHandleStyle = {
		position: 'absolute' as const,
		bottom: '0',
		right: '0',
		width: '0',
		height: '0',
		cursor: 'nwse-resize',
		borderStyle: 'solid',
		borderWidth: '0 0 12px 12px',
		borderColor: 'transparent transparent var(--wp-admin-theme-color, #0087be) transparent',
		zIndex: 1,
		display: disabled ? 'none' : 'block',
		transform: transform ? `translate3d(${ transform.x }px, ${ transform.y }px, 0)` : undefined,
	};

	return <div ref={ setNodeRef } style={ resizeHandleStyle } { ...listeners } { ...attributes } />;
}

export default function ResizeHandleWrapper( props: ResizeHandleProps ) {
	return (
		<DndContext>
			<ResizeHandle { ...props } />
		</DndContext>
	);
}
