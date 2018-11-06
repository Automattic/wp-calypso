/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';

export const isCalypsoifyGutenbergEnabled = ( state, siteId, skipSelectedEditorCheck ) => {
	if ( ! siteId ) {
		return false;
	}

	const calypsoifyGutenberg = isEnabled( 'calypsoify/gutenberg' );
	const isJetpack = isJetpackSite( state, siteId );
	const isVip = isVipSite( state, siteId );

	if ( skipSelectedEditorCheck ) {
		return calypsoifyGutenberg && ! isJetpack && ! isVip;
	}

	const selectedEditor = getSelectedEditor( state, siteId );

	return calypsoifyGutenberg && 'gutenberg' === selectedEditor && ! isJetpack && ! isVip;
};

export default isCalypsoifyGutenbergEnabled;
