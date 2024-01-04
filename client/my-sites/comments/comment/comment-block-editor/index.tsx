import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
	addApiMiddleware,
} from '@automattic/verbum-block-editor';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

loadBlocksWithCustomizations();
loadTextFormatting();

const CommentBlockEditor = ( {
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
			<Editor initialContent={ commentContent } onChange={ onChange } />
		</div>
	);
};

export default CommentBlockEditor;
