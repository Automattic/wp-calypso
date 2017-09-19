/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Geochart from '../geochart';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';

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
			<StatsModule
				query={ query }
				path="countryviews"
				period={ period }
				showSummaryLink={ ! summary }
				summary={ summary }
				moduleStrings={ moduleStrings.countries }
				statType="statsCountryViews"
			>
				<Geochart query={ query } />
			</StatsModule>
		);
	}
}

export default localize( StatCountries );
