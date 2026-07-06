import { getVisibleResizeHandles } from '../utils/constants';
import styles from './chat/Chat.module.css';

interface ResizeHandlesProps {
	resizable: boolean | 'horizontal' | 'vertical';
	onPointerDown: ( event: React.PointerEvent< HTMLDivElement > ) => void;
}

// The floating panel's resize-handle overlay. Renders only the handles the mode
// allows; each carries its edge in a data attribute the resize pointer loop reads.
export function ResizeHandles( {
	resizable,
	onPointerDown,
}: ResizeHandlesProps ) {
	return (
		<>
			{ getVisibleResizeHandles( resizable ).map( ( handle ) => (
				<div
					key={ handle.edge }
					data-slot="resize-handle"
					data-resize-edge={ handle.edge }
					className={ styles[ handle.className ] }
					style={ { cursor: handle.cursor } }
					onPointerDown={ onPointerDown }
				/>
			) ) }
		</>
	);
}
