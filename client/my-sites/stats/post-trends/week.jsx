/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Day from './day';

export default React.createClass( {

	displayName: 'PostTrendsWeek',

	propTypes: {
		startDate: PropTypes.object.isRequired,
		month: PropTypes.object.isRequired,
		max: PropTypes.number,
		streakData: PropTypes.object
	},

	getDefaultProps() {
		return {
			streakData: {},
			max: 0
		};
	},

	getDayComponents() {
		const days = [];
		const { month, startDate, streakData, max } = this.props;

		for ( let i = 0; i < 7; i++ ) {
			const dayDate = i18n.moment( startDate ).locale( 'en' ).add( i, 'day' );
			const postCount = streakData[ dayDate.format( 'YYYY-MM-DD' ) ] || 0;
			let classNames = [];
			let level = Math.ceil( ( postCount / max ) * 4 );

			if (
				dayDate.isBefore( i18n.moment( month ).startOf( 'month' ) ) ||
				dayDate.isAfter( i18n.moment( month ).endOf( 'month' ) )
			) {
				classNames.push( 'is-outside-month' );
			} else if ( dayDate.isAfter( i18n.moment().endOf( 'day' ) ) ) {
				classNames.push( 'is-after-today' );
			} else if ( level ) {
				if ( level > 4 ) {
					level = 4;
				}

				classNames.push( 'is-level-' + level );
			}

			days.push(
				<Day key={ dayDate.format( 'MMDD' ) }
					className={ classNames.join( ' ' ) }
					label={ dayDate.format( 'L' ) }
					postCount={ postCount }
				/>
			);
		}

		return days;
	},

	render() {
		return (
			<div className="post-trends__week">{ this.getDayComponents() }</div>
		);
	}

} );
