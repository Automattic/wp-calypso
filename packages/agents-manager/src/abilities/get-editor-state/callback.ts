import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { getCurrentPost } from '../../utils/editor-blocks';
import { successResult } from '../ability-result';
import type { DirtyEntityRecord } from '../save-changes/callback';
import type { AbilityResult } from '../types';

export function getEditorStateCallback(): AbilityResult {
	const post = getCurrentPost();
	const dirtyRecords: ( DirtyEntityRecord & { title: string } )[] =
		select( 'core' ).__experimentalGetDirtyEntityRecords();

	return successResult( __( 'Read the editor state.', __i18n_text_domain__ ), {
		open: post
			? { ...post, status: select( 'core/editor' ).getCurrentPostAttribute( 'status' ) }
			: null,
		unsavedChanges: dirtyRecords.map( ( { name, key, title } ) => ( {
			type: name,
			id: key,
			title,
		} ) ),
	} );
}
