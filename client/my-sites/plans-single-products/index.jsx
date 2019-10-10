/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import Product from './product';

/**
 * Style dependencies
 */
import './style.scss';

const PlansSingleProducts = () => {
	const displayBackup = isEnabled( 'plans/jetpack-backup' );
	const displayScan = isEnabled( 'plans/jetpack-scan' );

	return (
		<div className="plans-single-products">
			{ displayScan && <Product productSlug="jetpack-scan" /> }
			{ displayBackup && <Product productSlug="jetpack-backup" /> }
		</div>
	);
};

export default PlansSingleProducts;
