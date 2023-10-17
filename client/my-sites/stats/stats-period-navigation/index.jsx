import config from '@automattic/calypso-config';
import { localize, withRtl } from 'i18n-calypso';
import { flowRight } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import qs from 'qs';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { recordGoogleEvent as recordGoogleEventAction } from 'calypso/state/analytics/actions';
import NavigationArrows from '../navigation-arrows';
import IntervalDropdown from '../stats-interval-dropdown';
import StatsDateControl from '../stats-date-control';
import Intervals from 'calypso/blocks/stats-navigation/intervals';

import './style.scss';

class StatsPeriodNavigation extends PureComponent {
	static propTypes = {
		onPeriodChange: PropTypes.func,
		showArrows: PropTypes.bool,
		disablePreviousArrow: PropTypes.bool,
		disableNextArrow: PropTypes.bool,
		isRtl: PropTypes.bool,
		queryParams: PropTypes.object,
		startDate: PropTypes.bool,
		endDate: PropTypes.bool,
	};

	static defaultProps = {
		showArrows: true,
		disablePreviousArrow: false,
		disableNextArrow: false,
		isRtl: false,
		queryParams: {},
		startDate: false,
		endDate: false,
	};

	handleArrowEvent = ( arrow, href ) => {
		const { date, onPeriodChange, period, recordGoogleEvent } = this.props;
		recordGoogleEvent( 'Stats Period Navigation', `Clicked ${ arrow } ${ period }` );

		if ( onPeriodChange ) {
			onPeriodChange( {
				date,
				direction: arrow,
				period,
			} );
		}

		if ( href ) {
			page( href );
		}
	};

	isHoursPeriod = ( period ) => 'hour' === period;

	getNumberOfDays = ( isEmailStats, period, maxBars ) =>
		isEmailStats && ! this.isHoursPeriod( period ) ? maxBars : 1;

	calculatePeriod = ( period ) => ( this.isHoursPeriod( period ) ? 'day' : period );

	handleArrowNext = () => {
		const { date, moment, period, url, queryParams, isEmailStats, maxBars } = this.props;
		const numberOfDAys = this.getNumberOfDays( isEmailStats, period, maxBars );
		const usedPeriod = this.calculatePeriod( period );
		const nextDay = moment( date ).add( numberOfDAys, usedPeriod ).format( 'YYYY-MM-DD' );
		const nextDayQuery = qs.stringify( Object.assign( {}, queryParams, { startDate: nextDay } ), {
			addQueryPrefix: true,
		} );
		const href = `${ url }${ nextDayQuery }`;
		this.handleArrowEvent( 'next', href );
	};

	handleArrowPrevious = () => {
		const { date, moment, period, url, queryParams, isEmailStats, maxBars } = this.props;
		const numberOfDAys = this.getNumberOfDays( isEmailStats, period, maxBars );
		const usedPeriod = this.calculatePeriod( period );
		const previousDay = moment( date ).subtract( numberOfDAys, usedPeriod ).format( 'YYYY-MM-DD' );
		const previousDayQuery = qs.stringify(
			Object.assign( {}, queryParams, { startDate: previousDay } ),
			{ addQueryPrefix: true }
		);
		const href = `${ url }${ previousDayQuery }`;
		this.handleArrowEvent( 'previous', href );
	};

	render() {
		const {
			children,
			date,
			moment,
			period,
			showArrows,
			disablePreviousArrow,
			disableNextArrow,
			queryParams,
			slug,
			pathTemplate,
			onChangeChartQuantity,
		} = this.props;

		const isToday = moment( date ).isSame( moment(), period );
		// For the new date picker
		const isDateControlEnabled = config.isEnabled( 'stats/date-control' );

		return (
			<div className="stats-period-navigation">
				<div className="stats-period-navigation__children">{ children }</div>
				{ isDateControlEnabled ? (
					<div className="stats-period-navigation__date-control">
						<StatsDateControl
							slug={ slug }
							queryParams={ queryParams }
							period={ period }
							pathTemplate={ pathTemplate }
							onChangeChartQuantity={ onChangeChartQuantity }
						/>
						<div className="stats-period-navigation__period-control">
							{ showArrows && (
								<NavigationArrows
									disableNextArrow={ disableNextArrow || isToday }
									disablePreviousArrow={ disablePreviousArrow }
									onClickNext={ this.handleArrowNext }
									onClickPrevious={ this.handleArrowPrevious }
								/>
							) }
							<IntervalDropdown period={ period } pathTemplate={ pathTemplate } />
						</div>
					</div>
				) : (
					<>
						{ showArrows && (
							<NavigationArrows
								disableNextArrow={ disableNextArrow || isToday }
								disablePreviousArrow={ disablePreviousArrow }
								onClickNext={ this.handleArrowNext }
								onClickPrevious={ this.handleArrowPrevious }
							/>
						) }
						<Intervals selected={ period } pathTemplate={ pathTemplate } compact={ false } />
					</>
				) }
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
