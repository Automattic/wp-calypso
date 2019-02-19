/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { LabelItem } from './label-item';

class LabelItemInProgress extends LabelItem {
	render() {
		const { label, translate } = this.props;
		const { serviceName, labelIndex } = label;

		return (
			<div className="shipping-label__item">
				<p className="shipping-label__item-detail">
					{ translate( '%(service)s label (#%(labelIndex)d)', {
						args: {
							service: serviceName,
							labelIndex: labelIndex + 1,
						},
					} ) }
					<br />
					{ translate( 'Purchasing…' ) }
				</p>
			</div>
		);
	}
}

LabelItem.propTypes = {
	label: PropTypes.object.isRequired,
};

export default localize( LabelItemInProgress );
