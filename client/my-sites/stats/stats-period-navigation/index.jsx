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

	handleArrowNext = () => {
		const { date, moment, period, url, queryParams } = this.props;
		const tabValue = queryParams.tab;
		const nextDay = moment( date ).add( 1, period ).format( 'YYYY-MM-DD' );
		const nextDayQuery = qs.stringify(
			Object.assign(
				{},
				queryParams,
				{ startDate: nextDay },
				{ tab: tabValue ? tabValue : 'views' }
			),
			{
				addQueryPrefix: true,
			}
		);
		const href = `${ url }${ nextDayQuery }`;
		this.handleArrowEvent( 'next', href );
	};

	handleArrowPrevious = () => {
		const { date, moment, period, url, queryParams } = this.props;
		const previousDay = moment( date ).subtract( 1, period ).format( 'YYYY-MM-DD' );
		const getQueryParams = new URLSearchParams( window.location.search );
		const tabValue = getQueryParams.get( 'tab' );
		const previousDayQuery = qs.stringify(
			Object.assign(
				{},
				queryParams,
				{ startDate: previousDay },
				{ tab: tabValue ? tabValue : 'views' }
			),
			{ addQueryPrefix: true }
		);
		const href = `${ url }${ previousDayQuery }`;
		this.handleArrowEvent( 'previous', href );
	};

	render() {
		const { children, date, moment, period, showArrows, disablePreviousArrow, disableNextArrow } =
			this.props;

		const isToday = moment( date ).isSame( moment(), period );

		return (
			<div className="stats-period-navigation">
				<div className="stats-period-navigation__children">{ children }</div>
				{ showArrows && (
					<NavigationArrows
						disableNextArrow={ disableNextArrow || isToday }
						disablePreviousArrow={ disablePreviousArrow }
						onClickNext={ this.handleArrowNext }
						onClickPrevious={ this.handleArrowPrevious }
					/>
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
