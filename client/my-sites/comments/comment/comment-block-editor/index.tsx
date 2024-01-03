import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
	addApiMiddleware,
} from '@automattic/verbum-block-editor';
import { parse } from '@wordpress/blocks';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
				onChange={ onChange }
			/>
		</div>
	);
};
