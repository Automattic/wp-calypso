import { type Block } from '@wordpress/blocks';

export interface EditorProps {
	initialContent: string;
	focusOnMount?: boolean;
	onChange: ( content: string ) => void;
	isRTL: boolean;
	isDarkMode: boolean;
	customStyles?: string;
}

export interface StateWithUndoManager {
	value: Block[];
	setValue: ( value: Block[] ) => void;
	undo: () => void;
	redo: () => void;
}
