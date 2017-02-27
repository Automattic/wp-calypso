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
import StatsModule from '../stats-module';

class StatCountries extends Component {
	static propTypes = {
		summary: PropTypes.bool,
		path: PropTypes.string,
		period: PropTypes.object,
		date: PropTypes.string,
		onRefresh: PropTypes.func,
	};

	render() {
		const { summary, query, onRefresh, period } = this.props;
		const moduleStrings = statsStrings();

		return (
			<StatsModule
				query={ query }
				path="countryviews"
				period={ period }
				showSummaryLink={ ! summary }
				summary={ summary }
				moduleStrings={ moduleStrings.countries }
				statType="statsCountryViews"
				onRefresh={ onRefresh }
			>
				<Geochart query={ query } />
			</StatsModule>
		);
	}
}

export default localize( StatCountries );
