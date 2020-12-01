/**
 * Internal dependencies
 */
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import { getEditorPath } from 'calypso/state/editor/selectors';
import { addQueryArgs } from 'calypso/lib/route';
import versionCompare from 'calypso/lib/version-compare';

export const getGutenbergEditorUrl = ( state, siteId, postId = null, postType = 'post' ) => {
	// On some Jetpack sites (9.2+, not Atomic),
	// Calypsoify is currently broken.
	// Let's not enable it for them.
	// Reference: https://github.com/Automattic/jetpack/pull/17939
	const jetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
	const isBrokenJetpack =
		jetpackVersion &&
		versionCompare( jetpackVersion, '9.2-alpha', '>=' ) &&
		! isAtomicSite( state, siteId );

	if ( ! isEligibleForGutenframe( state, siteId ) && ! isBrokenJetpack ) {
		const siteAdminUrl = getSiteAdminUrl( state, siteId );
		let url = `${ siteAdminUrl }post-new.php?post_type=${ postType }`;

		if ( postId ) {
			url = `${ siteAdminUrl }post.php?post=${ postId }&action=edit`;
		}

		if ( 'gutenberg-redirect-and-style' === getSelectedEditor( state, siteId ) ) {
			url = addQueryArgs( { calypsoify: '1' }, url );
		}

		return url;
	}

	if ( postId ) {
		return getEditorPath( state, siteId, postId, postType );
	}

	const siteSlug = getSiteSlug( state, siteId );

	if ( 'post' === postType || 'page' === postType ) {
		return `/${ postType }/${ siteSlug }`;
	}
	return `/edit/${ postType }/${ siteSlug }`;
};

export default getGutenbergEditorUrl;
