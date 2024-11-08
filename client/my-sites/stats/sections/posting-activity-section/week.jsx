import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import Day from './day';

class PostTrendsWeek extends Component {
	static propTypes = {
		startDate: PropTypes.object.isRequired,
		month: PropTypes.object.isRequired,
		max: PropTypes.number,
		streakData: PropTypes.object,
		moment: PropTypes.func,
	};

	static defaultProps = {
		streakData: {},
		max: 0,
	};

	getDayComponents() {
		const days = [];
		const { month, startDate, streakData, max, moment } = this.props;

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
					date={ dayDate.toDate() }
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
