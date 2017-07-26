/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { initialShareState } from 'state/draft-feedback/reducer';

const selectDraftFeedbackState = ( state, siteId, postId ) =>
	get( state, [ 'draftFeedback', siteId, postId ], {
		emails: [],
		shares: {},
	} );

/**
 * Returns draft feedback shares for the specified site and post.
 *
 * @param 	{Object}	state	Global state tree
 * @param 	{number}	siteId	Site ID
 * @param 	{number}	postId	Post ID
 * @returns	{Array}				Array of draft share objects.
 */
export default createSelector( ( state, siteId, postId ) => {
	const { emails, shares } = selectDraftFeedbackState( state, siteId, postId );
	return emails.map( emailAddress => {
		const { isEnabled, comments } = shares[ emailAddress ] || initialShareState;
		return {
			emailAddress,
			isEnabled,
			comments,
		};
	} );
}, selectDraftFeedbackState );
