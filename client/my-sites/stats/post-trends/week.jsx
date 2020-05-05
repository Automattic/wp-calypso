/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Day from './day';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { withLocalizedMoment } from 'components/localized-moment';

class PostTrendsWeek extends Component {
	static propTypes = {
		startDate: PropTypes.object.isRequired,
		month: PropTypes.object.isRequired,
		max: PropTypes.number,
		streakData: PropTypes.object,
		moment: PropTypes.func,
		userLocale: PropTypes.string,
	};

	static defaultProps = {
		streakData: {},
		max: 0,
	};

	getDayComponents() {
		const days = [];
		const { month, startDate, streakData, max, moment, userLocale } = this.props;

		for ( let i = 0; i < 7; i++ ) {
			const dayDate = moment( startDate ).locale( 'en' ).add( i, 'day' );
			const postCount = streakData[ dayDate.format( 'YYYY-MM-DD' ) ] || 0;
			const classNames = [];
			let level = Math.ceil( ( postCount / max ) * 4 );

			if (
				dayDate.isBefore( moment( month ).startOf( 'month' ) ) ||
				dayDate.isAfter( moment( month ).endOf( 'month' ) )
			) {
				classNames.push( 'is-outside-month' );
			} else if ( dayDate.isAfter( moment().endOf( 'day' ) ) ) {
				classNames.push( 'is-after-today' );
			} else if ( level ) {
				if ( level > 4 ) {
					level = 4;
				}

				classNames.push( 'is-level-' + level );
			}

			days.push(
				<Day
					key={ dayDate.format( 'MMDD' ) }
					className={ classNames.join( ' ' ) }
					label={ dayDate.locale( userLocale ).format( 'L' ) }
					postCount={ postCount }
				/>
			);
		}

		return days;
	}

	render() {
		return <div className="post-trends__week">{ this.getDayComponents() }</div>;
	}
}

export default connect( ( state ) => ( { userLocale: getCurrentUserLocale( state ) } ) )(
	localize( withLocalizedMoment( PostTrendsWeek ) )
);
