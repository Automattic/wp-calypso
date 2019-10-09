/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Product from './product';

/**
 * Style dependencies
 */
import './style.scss';

const PlansSingleProducts = ( { translate } ) => {
	const displayBackup = isEnabled( 'plans/jetpack-backup' );
	const displayScan = isEnabled( 'plans/jetpack-scan' );

	if ( ! displayBackup && ! displayScan ) {
		return null;
	}

	return (
		<div className="plans-single-products">
			{ displayScan && <Product heading={ translate( 'Jetpack Scan' ) } /> }
			{ displayBackup && <Product heading={ translate( 'Jetpack Backup' ) } /> }
		</div>
	);
};

export default localize( PlansSingleProducts );
