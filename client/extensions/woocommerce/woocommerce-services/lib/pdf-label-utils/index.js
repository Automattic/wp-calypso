/**
 * External dependencies
 */
import { translate as __ } from 'i18n-calypso';
import querystring from 'querystring';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import getPDFSupport from '../utils/pdf-support';

const PAPER_SIZES = {
	a4: {
		name: __( 'A4' ),
		exclude: ( country ) => _.includes( [ 'US', 'CA', 'MX', 'DO' ], country ),
	},
	label: {
		name: __( 'Label (4"x6")' ),
	},
	legal: {
		name: __( 'Legal' ),
	},
	letter: {
		name: __( 'Letter' ),
	},
};

export const getPaperSizes = ( country ) => (
	_.reduce( PAPER_SIZES, ( result, { name, exclude }, key ) => {
		if ( ! exclude || ! exclude( country ) ) {
			result[ key ] = name;
		}
		return result;
	}, {} )
);

const _getPDFURL = ( paperSize, labels, baseURL, nonce ) => {
	if ( ! PAPER_SIZES[ paperSize ] ) {
		throw new Error( `Invalid paper size: ${ paperSize }` );
	}
	const params = {
		_wpnonce: nonce,
		paper_size: paperSize,
		'label_ids[]': _.filter( _.map( labels, 'labelId' ) ),
		'captions[]': _.filter( _.map( labels, 'caption' ) ),
	};
	return baseURL + '?' + querystring.stringify( params );
};

export const getPrintURL = ( paperSize, labels, { labelsPrintURL, nonce } ) => {
	return _getPDFURL( paperSize, labels, labelsPrintURL, nonce );
};

export const getPreviewURL = ( paperSize, labels, { labelsPreviewURL, nonce } ) => {
	return getPDFSupport() ? _getPDFURL( paperSize, labels, labelsPreviewURL, nonce ) : null;
};
