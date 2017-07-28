/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { draftShare } from 'state/draft-sharing/reducer';

const initialDraftShareState = draftShare( undefined, { type: '@@calypso/INIT' } );

const selectDraftSharingState = ( state, siteId, postId ) =>
	get( state, [ 'draftSharing', siteId, postId ] );

export default createSelector(
	( state, siteId, postId ) =>
		selectDraftSharingState( state, siteId, postId ) || initialDraftShareState,
	selectDraftSharingState,
);
