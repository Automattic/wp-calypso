import { Component } from 'react';

import './style.scss';

class DoughnutChart extends Component {
	render() {
		const { progress, text } = this.props;

		return (
			<div className="doughnut-chart__wrapper" style={ { '--percentage': progress * 100 } }>
				{ text }
			</div>
		);
	}
}

export default DoughnutChart;
