/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import Chart from 'components/chart';
import SectionHeader from 'components/section-header';

class GoogleMyBusinessStatsChart extends Component {
	static props = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		data: PropTypes.array.isRequired,
	};

	render() {
		const { title, description, data } = this.props;
		return (
			<div>
				<SectionHeader label={ title } />
				<Card>
					<CardHeading tagName={ 'h2' } size={ 16 }>
						{ description }
					</CardHeading>
					<hr className="gmb-stats__metric-hr" />
					<div className="gmb-stats__metric-chart">
						<Chart data={ data } />
					</div>
				</Card>
			</div>
		);
	}
}

export default GoogleMyBusinessStatsChart;
