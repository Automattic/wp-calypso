import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';
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

	handleClickNext = () => {
		this.handleClickArrow( 'next' );
	};

	handleClickPrevious = () => {
		this.handleClickArrow( 'previous' );
	};

	handleClickArrow = ( arrow, href ) => {
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
		const nextDay = moment( date ).add( 1, period ).format( 'YYYY-MM-DD' );
		const nextDayQuery = qs.stringify( Object.assign( {}, queryParams, { startDate: nextDay } ), {
			addQueryPrefix: true,
		} );
		const href = `${ url }${ nextDayQuery }`;
		this.handleClickArrow( 'next', href );
	};

	handleArrowPrevious = () => {
		const { date, moment, period, url, queryParams } = this.props;
		const previousDay = moment( date ).subtract( 1, period ).format( 'YYYY-MM-DD' );
		const previousDayQuery = qs.stringify(
			Object.assign( {}, queryParams, { startDate: previousDay } ),
			{ addQueryPrefix: true }
		);
		const href = `${ url }${ previousDayQuery }`;
		this.handleClickArrow( 'previous', href );
	};

	render() {
		const {
			children,
			date,
			moment,
			period,
			url,
			showArrows,
			disablePreviousArrow,
			disableNextArrow,
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
				<div className="stats-period-navigation__children">{ children }</div>
				<NavigationArrows
					disableNextArrow={ disableNextArrow || isToday }
					disablePreviousArrow={ disablePreviousArrow }
					onArrowNext={ this.handleArrowNext }
					onArrowPrevious={ this.handleArrowPrevious }
				/>
				{ showArrows && false && (
					<>
						<a
							className={ classNames( 'stats-period-navigation__previous', {
								'is-disabled': disablePreviousArrow,
							} ) }
							href={ `${ url }${ previousDayQuery }` }
							onClick={ this.handleClickPrevious }
						>
							<Icon className="gridicon" icon={ arrowLeft } />
						</a>
						<a
							className={ classNames( 'stats-period-navigation__next', {
								'is-disabled': disableNextArrow || isToday,
							} ) }
							href={ `${ url }${ nextDayQuery }` }
							onClick={ this.handleClickNext }
						>
							<Icon className="gridicon" icon={ arrowRight } />
						</a>
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
