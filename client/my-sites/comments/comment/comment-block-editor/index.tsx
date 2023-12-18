import { serialize, type BlockInstance, parse } from '@wordpress/blocks';
import { addApiMiddleware } from './api';
import { Editor } from './editor';
import { loadBlocksWithCustomizations } from './load-blocks';
import { loadTextFormatting } from './load-text-formatting';

import './editor-style.scss';

loadBlocksWithCustomizations();
loadTextFormatting();
// addApiMiddleware();

export const CommentBlockEditor = ( {
	onChange,
	commentContent,
}: {
	onChange: ( comment: string ) => void;
	commentContent: string;
} ) => {
	return (
		<div className="editor__wrapper">
			<Editor
				initialContent={ commentContent ? parse( commentContent ) : [] }
				saveContent={ ( content: BlockInstance[] ) => onChange( serialize( content ) ) }
			/>
		</div>
	);
};
