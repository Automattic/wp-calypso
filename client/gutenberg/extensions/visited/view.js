/** @format */
/**
 * External dependencies
 */
import cookie from 'cookie';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import './view.scss';
import { COOKIE_NAME, MAX_COOKIE_AGE, CRITERIA_AFTER, CRITERIA_BEFORE } from './constants';

// TODO: Remove debug capability
const debug = debugFactory( 'wp-gutenberg:visited-block' );

function getViewCount() {
	const cookies = cookie.parse( document.cookie );
	const value = cookies[ COOKIE_NAME ] || 0;
	debug( 'cookie value', +value );
	return +value;
}

function setViewCount( value ) {
	debug( 'new cookie value', value );
	document.cookie = cookie.serialize( COOKIE_NAME, value, {
		path: window.location.pathname,
		maxAge: MAX_COOKIE_AGE,
	} );
}

function extractDataAttributes( node ) {
	return {
		criteria: node.dataset.criteria,
		threshold: Number.isFinite( +node.dataset.threshold ) ? node.dataset.threshold : 0,
	};
}

function bindToBlocks() {
	const visitedBlocks = Array.from( document.querySelectorAll( '.wp-block-jetpack-visited' ) );
	if ( visitedBlocks.length === 0 ) {
		return;
	}

	const count = getViewCount();
	setViewCount( count + 1 );
	visitedBlocks.forEach( visitedBlock => {
		const { criteria, threshold } = extractDataAttributes( visitedBlock );
		debug( 'criteria and threshold', criteria, threshold );
		if (
			( criteria === CRITERIA_AFTER && count >= threshold ) ||
			( criteria === CRITERIA_BEFORE && count <= threshold )
		) {
			visitedBlock.classList.remove( 'wp-block-jetpack-visited-before-threshold' );
		}
	} );
}

window && window.addEventListener( 'load', bindToBlocks );
