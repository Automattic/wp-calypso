// Full-viewport overlay rendered while a move-drag is active. Captures pointer
// events and suppresses text selection so dragging over iframes/inputs stays smooth.
export function DragOverlay() {
	return (
		<div
			style={ {
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 9999,
				cursor: 'grabbing',
				pointerEvents: 'auto',
				userSelect: 'none',
				WebkitUserSelect: 'none',
				MozUserSelect: 'none',
				msUserSelect: 'none',
			} }
		/>
	);
}
