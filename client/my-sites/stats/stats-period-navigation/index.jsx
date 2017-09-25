/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordGoogleEvent as recordGoogleEventAction } from 'state/analytics/actions';

class StatsPeriodNavigation extends PureComponent {
	static propTypes = {
		onPeriodChange: PropTypes.func,
	};

	handleClickNext = () => {
		this.handleClickArrow( 'next' );
	}

	handleClickPrevious = () => {
		this.handleClickArrow( 'previous' );
	}

	handleClickArrow = arrow => {
		const {
			date,
			onPeriodChange,
			period,
			recordGoogleEvent,
		} = this.props;
		recordGoogleEvent( 'Stats Period Navigation', `Clicked ${ arrow } ${ period }` );

		if ( onPeriodChange ) {
			onPeriodChange( {
				date,
				direction: arrow,
				period,
			} );
		}
	};

	render() {
		const {
			children,
			date,
			moment,
			period,
			url,
		} = this.props;

		const isToday = moment( date ).isSame( moment(), period );
		const previousDay = moment( date ).subtract( 1, period ).format( 'YYYY-MM-DD' );
		const nextDay = moment( date ).add( 1, period ).format( 'YYYY-MM-DD' );

		return (
			<div className="stats-period-navigation">
				<a className="stats-period-navigation__previous"
					href={ `${ url }?startDate=${ previousDay }` }
					onClick={ this.handleClickPrevious }>
					<Gridicon icon="arrow-left" size={ 18 } />
				</a>
				<div className="stats-period-navigation__children">
					{ children }
				</div>
				{ ! isToday &&
					<a className="stats-period-navigation__next"
						href={ `${ url }?startDate=${ nextDay }` }
						onClick={ this.handleClickNext }>
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
	}
}

const connectComponent = connect( null, { recordGoogleEvent: recordGoogleEventAction } );

export default flowRight(
	connectComponent,
	localize,
)( StatsPeriodNavigation );
