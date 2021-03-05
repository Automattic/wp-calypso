/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import statsStrings from '../stats-strings';
import Geochart from '../geochart';
import StatsModule from '../stats-module';

/**
 * Style dependencies
 */
import './style.scss';

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
