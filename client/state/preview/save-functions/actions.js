/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:preview-save-functions' );

export function setSiteSettings( site, newSettings ) {
	return function() {
		debug( 'saving site settings:', newSettings );
		wpcom.undocumented().settings( site, 'post', newSettings, function( error, data ) {
			// TODO: handle errors, notify success
			debug( 'saving site settings complete', error, data );
		} );
	}
}

export function removeHeaderImage( site ) {
	return function() {
		debug( 'removing header image' );
		wpcom.undocumented().site( site ).removeHeaderImage( function( error, data ) {
			// TODO: handle errors, notify success
			debug( 'removing header image complete', error, data );
		} );
	}
}

export function setHeaderImage( site, url, ID, width, height ) {
	return function() {
		debug( 'setting header image', url, ID, width, height );
		wpcom.undocumented().site( site ).setHeaderImage( { url, ID, width, height }, function( error, data ) {
			// TODO: handle errors, notify success
			debug( 'setting header image complete', error, data );
		} );
	}
}

export function setHomePageSettings( site, isPageOnFront, pageOnFrontId, pageForPostsId ) {
	return function() {
		debug( 'setting home page settings', isPageOnFront, pageOnFrontId, pageForPostsId );
		wpcom.undocumented().site( site ).setHomePageSettings( { isPageOnFront, pageOnFrontId, pageForPostsId }, function( error, data ) {
			debug( 'setting home page settings complete', error, data );
		} );
	}
}

export function removeSiteLogo( site ) {
	return function() {
		debug( 'removing logo image' );
		wpcom.undocumented().site( site ).removeLogo( function( error, data ) {
			debug( 'removing logo image complete', error, data );
		} );
	}
}

export function setSiteLogo( site, logoPostId, logoUrl ) {
	return function() {
		debug( 'setting logo image', logoPostId, logoUrl );
		wpcom.undocumented().site( site ).setLogo( { id: logoPostId, url: logoUrl }, function( error, data ) {
			debug( 'setting logo image complete', error, data );
		} );
	}
}
