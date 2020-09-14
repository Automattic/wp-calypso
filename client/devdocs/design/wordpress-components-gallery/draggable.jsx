/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { Draggable } from '@wordpress/components';

const Box = ( props ) => {
	return (
		<div
			{ ...props }
			style={ {
				alignItems: 'center',
				display: 'flex',
				justifyContent: 'center',
				width: 100,
				height: 100,
				background: '#ddd',
			} }
		/>
	);
};

const DraggableExample = () => {
	const [ isDragging, setDragging ] = useState( false );

	return (
		<div>
			<p>Is Dragging? { isDragging ? 'Yes' : 'No' }</p>
			<div id="draggable-example-box" style={ { display: 'inline-flex' } }>
				<Draggable elementId="draggable-example-box">
					{ ( { onDraggableStart, onDraggableEnd } ) => {
						const handleOnDragStart = ( event ) => {
							setDragging( true );
							onDraggableStart( event );
						};
						const handleOnDragEnd = ( event ) => {
							setDragging( false );
							onDraggableEnd( event );
						};

						return (
							<Box onDragStart={ handleOnDragStart } onDragEnd={ handleOnDragEnd } draggable>
								Drag me!
							</Box>
						);
					} }
				</Draggable>
			</div>
		</div>
	);
};

export default DraggableExample;
