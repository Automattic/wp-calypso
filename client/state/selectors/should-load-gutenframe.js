import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import { getPreferredEditorView } from 'calypso/state/selectors/get-preferred-editor-view';

export const shouldLoadGutenframe = ( state, siteId, postType = 'post' ) =>
	isEligibleForGutenframe( state, siteId ) &&
	getPreferredEditorView( state, siteId, postType ) === 'default';

export default shouldLoadGutenframe;
