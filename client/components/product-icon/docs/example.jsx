/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import ProductIcon from '../index';
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
} from 'lib/plans/constants';
import {
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
} from 'lib/products-values/constants';

function ProductIconExample() {
	const wrapperStyle = {
		display: 'flex',
		flexFlow: 'row wrap',
	};
	const iconStyle = {
		width: 64,
		height: 64,
		margin: '8px 8px 8px 0',
	};

	return (
		<Fragment>
			<h3>Plan Icons</h3>
			<div style={ wrapperStyle }>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_FREE } />
				</div>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_PERSONAL } />
				</div>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_PREMIUM } />
				</div>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_BUSINESS } />
				</div>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_ECOMMERCE } />
				</div>
			</div>

			<hr />

			<h3>Jetpack Plan Icons</h3>
			<div style={ wrapperStyle }>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_JETPACK_FREE } />
				</div>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_JETPACK_PERSONAL } />
				</div>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_JETPACK_PREMIUM } />
				</div>
				<div style={ iconStyle }>
					<ProductIcon product={ PLAN_JETPACK_BUSINESS } />
				</div>
			</div>

			<hr />

			<h3>Jetpack Products</h3>
			<div style={ wrapperStyle }>
				<div style={ iconStyle }>
					<ProductIcon product={ PRODUCT_JETPACK_BACKUP_DAILY } />
				</div>
				<div style={ iconStyle }>
					<ProductIcon product={ PRODUCT_JETPACK_BACKUP_REALTIME } />
				</div>
			</div>
		</Fragment>
	);
}

ProductIconExample.displayName = 'ProductIcon';

export default ProductIconExample;
