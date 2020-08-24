/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize, withRtl } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';
import qs from 'qs';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import { recordGoogleEvent as recordGoogleEventAction } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class StatsPeriodNavigation extends PureComponent {
	static propTypes = {
		onPeriodChange: PropTypes.func,
		hidePreviousArrow: PropTypes.bool,
		hideNextArrow: PropTypes.bool,
		isRtl: PropTypes.bool,
		queryParams: PropTypes.object,
		startDate: PropTypes.bool,
		endDate: PropTypes.bool,
	};

	static defaultProps = {
		hidePreviousArrow: false,
		hideNextArrow: false,
		isRtl: false,
		queryParams: {},
		startDate: false,
		endDate: false,
	};

	handleClickNext = () => {
		this.handleClickArrow( 'next' );
	};

	handleClickPrevious = () => {
		this.handleClickArrow( 'previous' );
	};

	handleClickArrow = ( arrow ) => {
		const { date, onPeriodChange, period, recordGoogleEvent } = this.props;
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
			hidePreviousArrow,
			hideNextArrow,
			isRtl,
			queryParams,
		} = this.props;

		const isToday = moment( date ).isSame( moment(), period );
		const previousDay = moment( date ).subtract( 1, period ).format( 'YYYY-MM-DD' );
		const previousDayQuery = qs.stringify(
			Object.assign( {}, queryParams, { startDate: previousDay } ),
			{ addQueryPrefix: true }
		);
		const nextDay = moment( date ).add( 1, period ).format( 'YYYY-MM-DD' );
		const nextDayQuery = qs.stringify( Object.assign( {}, queryParams, { startDate: nextDay } ), {
			addQueryPrefix: true,
		} );

		return (
			<div className="stats-period-navigation">
				{
					<a
						className={ classNames( 'stats-period-navigation__previous', {
							'is-disabled': hidePreviousArrow,
						} ) }
						href={ `${ url }${ previousDayQuery }` }
						onClick={ this.handleClickPrevious }
					>
						<Gridicon icon={ isRtl ? 'arrow-right' : 'arrow-left' } size={ 18 } />
					</a>
				}
				<div className="stats-period-navigation__children">{ children }</div>
				{
					<a
						className={ classNames( 'stats-period-navigation__next', {
							'is-disabled': hideNextArrow || isToday,
						} ) }
						href={ `${ url }${ nextDayQuery }` }
						onClick={ this.handleClickNext }
					>
						<Gridicon icon={ isRtl ? 'arrow-left' : 'arrow-right' } size={ 18 } />
					</a>
				}
			</div>
		);
	}
}

const connectComponent = connect( null, { recordGoogleEvent: recordGoogleEventAction } );

export default flowRight(
	connectComponent,
	localize,
	withRtl,
	withLocalizedMoment
)( StatsPeriodNavigation );
