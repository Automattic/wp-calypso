/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import statsStrings from '../stats-strings';
import Geochart from '../geochart';
import StatsConnectedModule from '../stats-module/connected-list';

class StatCountries extends Component {
	static propTypes = {
		summary: PropTypes.bool,
		path: PropTypes.string,
		period: PropTypes.object,
		date: PropTypes.string,
	};

	render() {
		const { summary, query, period } = this.props;
		const moduleStrings = statsStrings();

		return (
			<StatsConnectedModule
				query={ query }
				path="countryviews"
				period={ period }
				showSummaryLink={ ! summary }
				summary={ summary }
				moduleStrings={ moduleStrings.countries }
				statType="statsCountryViews"
			>
				<Geochart query={ query } />
			</StatsConnectedModule>
		);
	}
}

export default localize( StatCountries );
