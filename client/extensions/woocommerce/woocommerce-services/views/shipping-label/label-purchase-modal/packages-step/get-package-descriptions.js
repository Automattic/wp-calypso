/**
 * External dependencies
 */
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

export default ( selected, all, addNames ) => {
	let pckgCount = 0;

	return _.mapValues( selected, ( pckg ) => {
		if ( 'individual' === pckg.box_id ) {
			return pckg.items[ 0 ].name;
		}

		pckgCount++;

		const pckgData = all[ pckg.box_id ];
		const isEnvelope = pckgData && pckgData.is_letter;
		const pckgName = addNames && pckgData ? pckgData.name : false;

		if ( isEnvelope ) {
			return pckgName
				? __( 'Envelope %d: %s', { args: [ pckgCount, pckgName ] } )
				: __( 'Envelope %d', { args: [ pckgCount ] } );
		}

		return pckgName
			? __( 'Package %d: %s', { args: [ pckgCount, pckgName ] } )
			: __( 'Package %d', { args: [ pckgCount ] } );
	} );
};
