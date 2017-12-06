/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { recordGoogleEvent as recordGoogleEventAction } from 'state/analytics/actions';
import { isRtl as isRtlSelector } from 'state/selectors';

class StatsPeriodNavigation extends PureComponent {
	static propTypes = {
		onPeriodChange: PropTypes.func,
		hidePreviousArrow: PropTypes.bool,
		isRtl: PropTypes.bool,
	};

	static defaultProps = {
		hidePreviousArrow: false,
		isRtl: false,
	};

	handleClickNext = () => {
		this.handleClickArrow( 'next' );
	};

	handleClickPrevious = () => {
		this.handleClickArrow( 'previous' );
	};

	handleClickArrow = arrow => {
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
		const { children, date, moment, period, url, hidePreviousArrow, isRtl } = this.props;

		const isToday = moment( date ).isSame( moment(), period );
		const previousDay = moment( date )
			.subtract( 1, period )
			.format( 'YYYY-MM-DD' );
		const nextDay = moment( date )
			.add( 1, period )
			.format( 'YYYY-MM-DD' );

		return (
			<div className="stats-period-navigation">
				{
					<a
						className={ classNames( 'stats-period-navigation__previous', {
							'is-disabled': hidePreviousArrow,
						} ) }
						href={ `${ url }?startDate=${ previousDay }` }
						onClick={ this.handleClickPrevious }
					>
						<Gridicon icon={ isRtl ? 'arrow-right' : 'arrow-left' } size={ 18 } />
					</a>
				}
				<div className="stats-period-navigation__children">{ children }</div>
				{ ! isToday && (
					<a
						className="stats-period-navigation__next"
						href={ `${ url }?startDate=${ nextDay }` }
						onClick={ this.handleClickNext }
					>
						<Gridicon icon={ isRtl ? 'arrow-left' : 'arrow-right' } size={ 18 } />
					</a>
				) }
				{ isToday && (
					<span className="stats-period-navigation__next is-disabled">
						<Gridicon icon="arrow-right" size={ 18 } />
					</span>
				) }
			</div>
		);
	}
}

const connectComponent = connect(
	state => ( {
		isRtl: isRtlSelector( state ),
	} ),
	{ recordGoogleEvent: recordGoogleEventAction }
);

export default flowRight( connectComponent, localize )( StatsPeriodNavigation );
