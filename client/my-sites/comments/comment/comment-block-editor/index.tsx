import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
	addApiMiddleware,
} from '@automattic/verbum-block-editor';
import { useRtl } from 'i18n-calypso';
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
	const isRTL = useRtl();

	useEffect( () => {
		if ( siteId ) {
			addApiMiddleware( siteId );
		}
	}, [ siteId ] );

	return (
		<div className="verbum-editor-wrapper">
			<Editor initialContent={ commentContent } onChange={ onChange } isRTL={ isRTL } />
		</div>
	);
};

export default CommentBlockEditor;
