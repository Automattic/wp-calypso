/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'gridicons';

class DateRangeHeader extends Component {
	static propTypes = {
		onApplyClick: PropTypes.func,
		onCancelClick: PropTypes.func,
		applyButtonText: PropTypes.string,
		cancelButtonText: PropTypes.string,
	};

	static defaultProps = {
		onApplyClick: noop,
		onCancelClick: noop,
		applyButtonText: 'Apply',
		cancelButtonText: 'Cancel',
	};

	render() {
		return (
			<div className="date-range__popover-header">
				<Button className="date-range__cancel-btn" onClick={ this.props.onCancelClick } compact>
					{ this.props.cancelButtonText }
				</Button>
				<Button
					className="date-range__apply-btn"
					onClick={ this.props.onApplyClick }
					primary
					compact
				>
					<Gridicon icon="checkmark" />
					{ this.props.applyButtonText }
				</Button>
			</div>
		);
	}
}

export default DateRangeHeader;
