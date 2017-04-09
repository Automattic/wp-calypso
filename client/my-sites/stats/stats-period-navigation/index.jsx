/**
 * External dependencies
 */
import React from 'react';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { recordGoogleEvent } from 'state/analytics/actions';

const StatsPeriodNavigation = props => {
	const { url, children, date, period, moment } = props;
	const isToday = moment( date ).isSame( moment(), period );
	const previousDay = moment( date ).subtract( 1, period ).format( 'YYYY-MM-DD' );
	const nextDay = moment( date ).add( 1, period ).format( 'YYYY-MM-DD' );
	const clickArrow = arrow => () => {
		props.recordGoogleEvent( 'Stats Period Navigation', `Clicked ${ arrow } ${ period }` );
	};

	return (
		<div className="stats-period-navigation">
			<a className="stats-period-navigation__previous"
				href={ `${ url }?startDate=${ previousDay }` }
				onClick={ clickArrow( 'previous' ) }>
				<Gridicon icon="arrow-left" size={ 18 } />
			</a>
			<div className="stats-period-navigation__children">
				{ children }
			</div>
			{ ! isToday &&
				<a className="stats-period-navigation__next"
					href={ `${ url }?startDate=${ nextDay }` }
					onClick={ clickArrow( 'next' ) }>
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

const connectComponent = connect( undefined, { recordGoogleEvent } );

export default  flowRight(
	connectComponent,
	localize,
)( StatsPeriodNavigation );
