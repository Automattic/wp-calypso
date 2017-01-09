/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const StatsPeriodNavigation = ( { url, children, date, period, moment } ) => {
	const isToday = moment( date ).isSame( moment(), period );
	const previousDay = moment( date ).subtract( 1, period ).format( 'YYYY-MM-DD' );
	const nextDay = moment( date ).add( 1, period ).format( 'YYYY-MM-DD' );

	return (
		<div className="stats-period-navigation">
			<a className="stats-period-navigation__previous"
				href={ `${ url }?startDate=${ previousDay }` }>
				<Gridicon icon="arrow-left" size={ 18 } />
			</a>
			{ children }
			{ ! isToday &&
				<a className="stats-period-navigation__next"
					href={ `${ url }?startDate=${ nextDay }` }>
					<Gridicon icon="arrow-right" size={ 18 } />
				</a>
			}
			{ isToday &&
				<span className="stats-period-navigation__next is-disabled">
					<Gridicon icon="arrow-right" size={ 18 } />
				</span>
			}
		</div>
	);
};

export default localize( StatsPeriodNavigation );
