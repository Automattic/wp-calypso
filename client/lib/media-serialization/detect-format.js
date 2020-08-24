/**
 * External dependencies
 */

import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { Formats, MediaTypes } from './constants';
import { getMimePrefix } from 'lib/media/utils';

/**
 * Module variables
 */
const VALID_SHORTCODE_TYPES = [ 'closed', 'self-closing', 'single' ];

export default function ( node ) {
	if ( 'string' === typeof node ) {
		return Formats.STRING;
	}

	if ( 'object' === typeof node && 'string' === typeof node.nodeName ) {
		return Formats.DOM;
	}

	if ( node && node.tag && includes( VALID_SHORTCODE_TYPES, node.type ) ) {
		return Formats.SHORTCODE;
	}

	if ( node && node.type && includes( MediaTypes, node.type ) ) {
		return Formats.OBJECT;
	}

	if ( getMimePrefix( node ) ) {
		return Formats.API;
	}

	return Formats.UNKNOWN;
}
