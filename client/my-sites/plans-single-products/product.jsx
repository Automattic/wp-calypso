/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

class PlansSingleProduct extends Component {
	static propTypes = {
		heading: PropTypes.string.isRequired,
	};

	render() {
		const { heading } = this.props;

		return (
			<div className="plans-single-products__card">
				<h3 className="plans-single-products__heading">{ heading }</h3>
			</div>
		);
	}
}

export default localize( PlansSingleProduct );
