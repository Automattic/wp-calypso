/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import Button from 'components/button';

export class DateRangeHeader extends Component {
	static propTypes = {
		onApplyClick: PropTypes.func,
		onCancelClick: PropTypes.func,
		applyButtonText: PropTypes.string,
		cancelButtonText: PropTypes.string,
	};

	static defaultProps = {
		onApplyClick: noop,
		onCancelClick: noop,
	};

	render() {
		return (
			<div className="date-range__popover-header">
				<Button className="date-range__cancel-btn" onClick={ this.props.onCancelClick } compact>
					{ this.props.cancelButtonText || this.props.translate( 'Cancel' ) }
				</Button>
				<Button
					className="date-range__apply-btn"
					onClick={ this.props.onApplyClick }
					primary
					compact
				>
					{ this.props.cancelButtonText || this.props.translate( 'Apply' ) }
				</Button>
			</div>
		);
	}
}

export default localize( DateRangeHeader );
