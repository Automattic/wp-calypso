/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { showGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';
import EditorGutenbergOptInDialog from 'post-editor/editor-gutenberg-opt-in-dialog';
import EditorGutenbergBlocksWarningDialog from 'post-editor/editor-gutenberg-blocks-warning-dialog';
import { getEditorRawContent, isEditorLoading } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isPrivateSite from 'state/selectors/is-private-site';

const EditorGutenbergDialogs: React.FC< {} > = () => {
	const [ hasGutenbergBlocks, setHasGutenbergBlocks ] = useState< boolean | null >( null );

	const siteId = useSelector( getSelectedSiteId ) as number;
	const isAtomic = useSelector( state => isSiteAutomatedTransfer( state, siteId ) );
	const isPrivate = useSelector( state => isPrivateSite( state, siteId ) );
	const isPrivateAtomic = isAtomic && isPrivate;

	const postContent = useSelector( getEditorRawContent );
	const isLoading = useSelector( isEditorLoading );
	const isPostContentLoaded = ! isLoading && postContent !== null;

	const dispatch = useDispatch();

	useEffect(
		function() {
			if ( hasGutenbergBlocks !== null || ! isPostContentLoaded ) {
				return;
			}
			const hasGutenbergContent = ( postContent || '' ).indexOf( '<!-- wp:' ) !== -1;
			setHasGutenbergBlocks( hasGutenbergContent );

			// If a private atomic site uses classic editor, we want to always show some dialog, even
			// if it doesn't have any Gutenberg blocks. Instead of saying "you may lose some data and formatting",
			// let's just show the opt in dialog instead.
			if ( ! hasGutenbergContent && isPrivateAtomic ) {
				dispatch( showGutenbergOptInDialog() );
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ dispatch, isPrivateAtomic, isPostContentLoaded, postContent ]
	);

	return (
		<>
			<EditorGutenbergOptInDialog />
			<EditorGutenbergBlocksWarningDialog hasGutenbergBlocks={ !! hasGutenbergBlocks } />
		</>
	);
};
EditorGutenbergDialogs.displayName = 'EditorGutenbergDialogs';

export default EditorGutenbergDialogs;
