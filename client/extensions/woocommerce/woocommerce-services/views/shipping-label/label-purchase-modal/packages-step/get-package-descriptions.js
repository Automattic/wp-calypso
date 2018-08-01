/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { mapValues } from 'lodash';

export default ( selected, all, addNames ) => {
	let pckgCount = 0;

	return mapValues( selected, pckg => {
		if ( 'individual' === pckg.box_id ) {
			return pckg.items[ 0 ].name;
		}

		pckgCount++;

		const pckgData = all[ pckg.box_id ];
		const isEnvelope = pckgData && pckgData.is_letter;
		const pckgName = addNames && pckgData ? pckgData.name : false;

		if ( isEnvelope ) {
			return pckgName
				? translate( 'Envelope %(packageNum)d: %(packageName)s', {
						args: { packageNum: pckgCount, packageName: pckgName },
				  } )
				: translate( 'Envelope %(packageNum)d', { args: { packageNum: pckgCount } } );
		}

		return pckgName
			? translate( 'Package %(packageNum)d: %(packageName)s', {
					args: { packageNum: pckgCount, packageName: pckgName },
			  } )
			: translate( 'Package %(packageNum)d', { args: { packageNum: pckgCount } } );
	} );
};
