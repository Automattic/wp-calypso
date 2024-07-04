import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Geochart from '../geochart';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';

import './style.scss';

// TODO: to delete if/when cleaning feature flag stats/empty-module-traffic

class StatsCountries extends Component {
	static propTypes = {
		summary: PropTypes.bool,
		path: PropTypes.string,
		period: PropTypes.object,
		date: PropTypes.string,
		listItemClassName: PropTypes.string,
		className: PropTypes.string,
	};

	render() {
		const { summary, query, period, listItemClassName, className } = this.props;
		const moduleStrings = statsStrings();

		return (
			<StatsModule
				query={ query }
				path="countryviews"
				period={ period }
				showSummaryLink={ ! summary }
				hideSummaryLink={ !! summary }
				summary={ summary }
				moduleStrings={ moduleStrings.countries }
				statType="statsCountryViews"
				listItemClassName={ listItemClassName }
				className={ className }
			>
				<Geochart query={ query } />
			</StatsModule>
		);
	}
}

export default localize( StatsCountries );
