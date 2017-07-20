/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ShippingPackage = ( { translate, type, name, dimensions } ) => {
	const icon = 'envelope' === type ? 'mail' : 'product';

	return (
		<div className="packages__packages-row">
			<div className="packages__packages-row-icon">
				<Gridicon icon={ icon } size={ 18 } />
			</div>
			<div className="packages__packages-row-details">
				<div className="packages__packages-row-details-name">{ name }</div>
			</div>
			<div className="packages__packages-row-dimensions">{ dimensions }</div>
			<div className="packages__packages-row-actions">
				<Button compact>{ translate( 'Edit' ) }</Button>
			</div>
		</div>
	);
};

ShippingPackage.propTypes = {
	type: PropTypes.string,
	name: PropTypes.string,
	dimensions: PropTypes.string
};

export default localize( ShippingPackage );
