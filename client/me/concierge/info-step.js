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
import PrimaryHeader from './primary-header';

class InfoStep extends Component {
	static propTypes = {
		onComplete: PropTypes.func.isRequired,
	};

	render() {
		return (
			<div>
				<PrimaryHeader />
				<CompactCard>
					Here is the first step where the customer gives us their information
				</CompactCard>
				<CompactCard>
					<Button onClick={ this.props.onComplete }>Continue to calendar</Button>
				</CompactCard>
			</div>
		);
	}
}

export default InfoStep;
