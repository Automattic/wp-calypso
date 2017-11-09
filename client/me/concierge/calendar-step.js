/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';

class CalendarStep extends Component {
	static propTypes = {
		onBack: PropTypes.func.isRequired,
		onComplete: PropTypes.func.isRequired,
	};

	render() {
		return (
			<div>
				<HeaderCake onClick={ this.props.onBack } />
				<CompactCard>Here is the second step where the customer picks a date</CompactCard>
				<CompactCard>
					<Button primary onClick={ this.props.onComplete }>
						Book this session
					</Button>
				</CompactCard>
			</div>
		);
	}
}

export default CalendarStep;
