/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import ProductIcon from '../index';

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
					<ProductIcon slug="free" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="blogger" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="personal" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="premium" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="business" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="ecommerce" />
				</div>
			</div>

			<hr />

			<h3>Jetpack Plan Icons</h3>
			<div style={ wrapperStyle }>
				<div style={ iconStyle }>
					<ProductIcon slug="jetpack-free" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="jetpack-personal" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="jetpack-premium" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="jetpack-professional" />
				</div>
			</div>

			<hr />

			<h3>Jetpack Products</h3>
			<div style={ wrapperStyle }>
				<div style={ iconStyle }>
					<ProductIcon slug="jetpack-backup-daily" />
				</div>
				<div style={ iconStyle }>
					<ProductIcon slug="jetpack-backup-realtime" />
				</div>
			</div>
		</Fragment>
	);
}

ProductIconExample.displayName = 'ProductIcon';

export default ProductIconExample;
