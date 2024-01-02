import { type BlockInstance, parse } from '@wordpress/blocks';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { addApiMiddleware } from './api';
import { Editor } from './editor';
import { loadBlocksWithCustomizations } from './load-blocks';
import { loadTextFormatting } from './load-text-formatting';
import './editor-style.scss';

loadBlocksWithCustomizations();
loadTextFormatting();

export const CommentBlockEditor = ( {
	onChange,
	commentContent,
}: {
	onChange: ( comment: string ) => void;
	commentContent: string;
} ) => {
	const siteId = useSelector( getSelectedSiteId );

	useEffect( () => {
		if ( siteId ) {
			addApiMiddleware( siteId );
		}
	}, [ siteId ] );

	return (
		<div className="editor__wrapper">
			<Editor
				initialContent={ commentContent ? parse( commentContent ) : [] }
				onChange={ ( content: BlockInstance[] ) => onChange( { target: { value: content } } ) }
			/>
		</div>
	);
};
