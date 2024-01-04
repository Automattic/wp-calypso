import { type BlockInstance } from '@wordpress/blocks';

export interface EditorProps {
	initialContent: string;
	onChange: ( content: string ) => void;
}

export interface StateWithUndoManager {
	value: BlockInstance[];
	setValue: ( value: BlockInstance[] ) => void;
	undo: () => void;
	redo: () => void;
}
