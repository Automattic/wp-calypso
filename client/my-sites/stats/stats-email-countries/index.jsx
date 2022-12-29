import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import StatsEmailModule from '../stats-email-module';

import './style.scss';

class StatEmailCountries extends Component {
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
				path="countries"
				statType="opens"
				postId={ postId }
				siteId={ siteId }
				period={ period }
				date={ date }
			/>
		);
	}
}

export default localize( StatEmailCountries );
