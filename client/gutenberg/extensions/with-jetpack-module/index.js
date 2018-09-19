/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
import { withSelect } from '@wordpress/data';

export default function withJetpackModule( module ) {
	return withSelect( select => {
		const { getAllModules } = select( 'jetpack/modules' );
		return {
			jetpackModule: get( getAllModules(), [ module ] ),
		};
	} );
}
