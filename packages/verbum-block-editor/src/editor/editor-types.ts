import { type BlockInstance } from '@wordpress/blocks';

export interface EditorProps {
	initialContent: string;
	onChange: ( content: string ) => void;
	isRTL: boolean;
	isDarkMode: boolean;
}

export interface StateWithUndoManager {
	value: BlockInstance[];
	setValue: ( value: BlockInstance[] ) => void;
	undo: () => void;
	redo: () => void;
}
