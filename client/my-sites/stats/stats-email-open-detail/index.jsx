import { Component } from 'react';
// import { connect } from 'react-redux';
import Geochart from 'calypso/my-sites/stats/geochart';

class StatsEmailOpenDetail extends Component {
	render() {
		return (
			<div>
				Email Stats placeholder
				<Geochart kind="email" />
			</div>
		);
	}
}

export default StatsEmailOpenDetail;
