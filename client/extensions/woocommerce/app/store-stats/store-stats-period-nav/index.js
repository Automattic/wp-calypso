/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import Intervals from 'blocks/stats-navigation/intervals';
import DatePicker from 'my-sites/stats/stats-date-picker';

const goBack = () => {
	window && window.history.back();
};

const StoreStatsPeriodNav = ( {
	type,
	selectedDate,
	unit,
	slug,
	moment,
	query,
	title,
	statType,
} ) => {
	return (
		<Fragment>
			<HeaderCake onClick={ goBack }>{ title }</HeaderCake>
			<StatsPeriodNavigation
				date={ selectedDate }
				period={ unit }
				url={ `/store/stats/${ type }/${ unit }/${ slug }` }
			>
				<DatePicker
					period={ unit }
					date={
						unit === 'week'
							? moment( selectedDate, 'YYYY-MM-DD' )
									.subtract( 1, 'days' )
									.format( 'YYYY-MM-DD' )
							: selectedDate
					}
					query={ query }
					statType={ statType }
					showQueryDate
				/>
			</StatsPeriodNavigation>
			<Intervals
				selected={ unit }
				pathTemplate={ `/store/stats/${ type }/{{ interval }}/${ slug }` }
				standalone
			/>
		</Fragment>
	);
};

StoreStatsPeriodNav.propTypes = {
	type: PropTypes.string.isRequired,
	selectedDate: PropTypes.string.isRequired,
	unit: PropTypes.oneOf( [ 'day', 'week', 'month', 'year' ] ),
	slug: PropTypes.string,
	query: PropTypes.object.isRequired,
	title: PropTypes.string,
	statType: PropTypes.string.isRequired,
};

export default localize( StoreStatsPeriodNav );
