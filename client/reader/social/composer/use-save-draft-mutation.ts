import { mutationOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface SaveDraftMutationVariables {
	siteId: number;
	content: string;
}

interface SaveDraftMutationResult {
	ID: number;
	site_ID: number;
	URL: string;
}

export function saveDraftMutation() {
	return mutationOptions< SaveDraftMutationResult, Error, SaveDraftMutationVariables >( {
		mutationKey: [ 'reader-social-composer-overflow', 'save-draft' ],
		mutationFn: ( { siteId, content } ) =>
			wpcom.site( siteId ).post().add( { content, status: 'draft' } ),
	} );
}
