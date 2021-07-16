/**
 * Internal dependencies
 */
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import { getPreferredEditorView } from 'calypso/state/selectors/get-preferred-editor-view';

export const shouldLoadGutenframe = ( state, siteId ) =>
	isEligibleForGutenframe( state, siteId ) && getPreferredEditorView( state, siteId ) === 'default';

export default shouldLoadGutenframe;
