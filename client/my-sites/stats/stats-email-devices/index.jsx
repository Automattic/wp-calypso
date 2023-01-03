import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import StatsEmailModule from '../stats-email-module';

class StatEmailDevices extends Component {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		period: PropTypes.string,
		date: PropTypes.string,
	};

	render() {
		const { postId, siteId, period, date } = this.props;

		return (
			<StatsEmailModule
				path="devices"
				statType="opens"
				postId={ postId }
				siteId={ siteId }
				period={ period }
				date={ date }
			/>
		);
	}
}

export default localize( StatEmailDevices );
