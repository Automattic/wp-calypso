import { isJetpackSite } from '@automattic/data-stores/src/site/selectors';
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import { getPreferredEditorView } from 'calypso/state/selectors/get-preferred-editor-view';
import isSSOEnabled from 'calypso/state/sites/selectors/is-sso-enabled';

export const shouldLoadGutenframe = ( state, siteId, postType = 'post' ) => {
	if ( isJetpackSite( state, siteId ) && ! isSSOEnabled( state, siteId ) ) {
		return false;
	}

	return (
		isEligibleForGutenframe( state, siteId ) &&
		getPreferredEditorView( state, siteId, postType ) === 'default'
	);
};

export default shouldLoadGutenframe;
