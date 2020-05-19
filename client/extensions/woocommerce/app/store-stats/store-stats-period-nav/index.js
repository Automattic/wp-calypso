/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import page from 'page';
import qs from 'qs';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import { withLocalizedMoment } from 'components/localized-moment';
import StatsPeriodNavigation from 'my-sites/stats/stats-period-navigation';
import Intervals from 'blocks/stats-navigation/intervals';
import DatePicker from 'my-sites/stats/stats-date-picker';
import { getWidgetPath } from 'woocommerce/app/store-stats/utils';

const goBack = ( unit, slug, queryParams ) => {
	const { startDate } = queryParams;
	const query = startDate ? { startDate } : {};
	const widgetPath = getWidgetPath( unit, slug, query );
	const url = `/store/stats/orders${ widgetPath }`;
	return () => {
		setTimeout( () => {
			page( url );
		} );
	};
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
	queryParams,
} ) => {
	const { startDate, ...intervalQuery } = queryParams;
	const intervalQueryString = qs.stringify( intervalQuery, { addQueryPrefix: true } );
	return (
		<Fragment>
			<HeaderCake onClick={ goBack( unit, slug, queryParams ) }>{ title }</HeaderCake>
			<StatsPeriodNavigation
				date={ selectedDate }
				period={ unit }
				url={ `/store/stats/${ type }/${ unit }/${ slug }` }
				queryParams={ queryParams }
			>
				<DatePicker
					period={ unit }
					date={
						unit === 'week'
							? moment( selectedDate, 'YYYY-MM-DD' ).subtract( 1, 'days' ).format( 'YYYY-MM-DD' )
							: selectedDate
					}
					query={ query }
					statType={ statType }
					showQueryDate
				/>
			</StatsPeriodNavigation>
			<Intervals
				selected={ unit }
				pathTemplate={ `/store/stats/${ type }/{{ interval }}/${ slug }${ intervalQueryString }` }
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
	queryParams: PropTypes.object,
};

export default localize( withLocalizedMoment( StoreStatsPeriodNav ) );
