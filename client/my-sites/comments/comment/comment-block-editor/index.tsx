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
			addApiMiddleware( ( url: string ) => ( {
				path: `/sites/${ encodeURIComponent( siteId ) }/proxy`,
				query: `url=${ encodeURIComponent( url ) }`,
				apiNamespace: 'oembed/1.0',
			} ) );
		}
	}, [ siteId ] );

	return (
		<div className="verbum-editor-wrapper">
			<Editor
				initialContent={ commentContent }
				onChange={ onChange }
				isRTL={ isRTL }
				isDarkMode={ false }
			/>
		</div>
	);
};

export default CommentBlockEditor;
