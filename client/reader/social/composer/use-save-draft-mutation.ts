import { mutationOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface SaveDraftMutationVariables {
	siteId: number;
	content: string;
}

export interface SaveDraftMutationResult {
	ID: number;
}

export function saveDraftMutation() {
	return mutationOptions< SaveDraftMutationResult, Error, SaveDraftMutationVariables >( {
		mutationKey: [ 'reader-social-composer-overflow', 'save-draft' ],
		mutationFn: ( { siteId, content } ) =>
			wpcom.site( siteId ).post().add( { content, status: 'draft' } ),
	} );
}
