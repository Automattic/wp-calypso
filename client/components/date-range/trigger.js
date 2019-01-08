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

class DateRangeTrigger extends Component {
	static propTypes = {
		startDateText: PropTypes.string.isRequired,
		endDateText: PropTypes.string.isRequired,
		buttonRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.instanceOf( Button ) } ),
		] ).isRequired,
		onTriggerClick: PropTypes.func,
	};

	static defaultProps = {
		onTriggerClick: noop,
	};

	render() {
		const props = this.props;

		return (
			<Button
				className="date-range__trigger-btn"
				ref={ props.buttonRef }
				onClick={ props.onTriggerClick }
				compact
			>
				<Gridicon className="date-range__trigger-btn-icon" icon="calendar" />
				<span className="date-range__trigger-btn-text">
					{ props.startDateText }
					&nbsp; - &nbsp;
					{ props.endDateText }
				</span>
				<Gridicon icon="chevron-down" />
			</Button>
		);
	}
}

export default DateRangeTrigger;
