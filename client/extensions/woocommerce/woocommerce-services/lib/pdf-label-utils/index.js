/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import querystring from 'querystring';
import { includes, reduce, filter, map } from 'lodash';

/**
 * Internal dependencies
 */
import * as api from '../../api';

const PAPER_SIZES = {
	a4: {
		name: translate( 'A4' ),
		exclude: country => includes( [ 'US', 'CA', 'MX', 'DO' ], country ),
	},
	label: {
		name: translate( 'Label (4"x6")' ),
	},
	legal: {
		name: translate( 'Legal' ),
	},
	letter: {
		name: translate( 'Letter' ),
	},
};

export const getPaperSizes = country =>
	reduce(
		PAPER_SIZES,
		( result, { name, exclude }, key ) => {
			if ( ! exclude || ! exclude( country ) ) {
				result[ key ] = name;
			}
			return result;
		},
		{}
	);

export const getPrintURL = ( siteId, paperSize, labels ) => {
	if ( ! PAPER_SIZES[ paperSize ] ) {
		throw new Error( `Invalid paper size: ${ paperSize }` );
	}
	const params = {
		paper_size: paperSize,
		// send params as a CSV to avoid conflicts with some plugins out there (woocommerce-services #1111)
		label_id_csv: filter( map( labels, 'labelId' ) ).join( ',' ),
		caption_csv: filter(
			map( labels, l => ( l.caption ? encodeURIComponent( l.caption ) : null ) )
		).join( ',' ),
		json: true,
	};
	return api.url.labelsPrint() + '?' + querystring.stringify( params );
};
