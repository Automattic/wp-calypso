/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import Popover from 'components/popover';
import Tooltip from 'components/chart/tooltip';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSiteStatsPostsCountByDay,
	getSiteStatsMaxPostsByDay
} from 'state/stats/lists/selectors';

const PostTrendsDay = React.createClass( {

	displayName: 'PostTrendsDay',

	propTypes: {
		date: PropTypes.object.isRequired,
		month: PropTypes.object.isRequired,
		max: PropTypes.number,
		postCount: PropTypes.number
	},

	getInitialState: function() {
		return { showPopover: false };
	},

	mouseEnter: function() {
		this.setState( { showPopover: true } );
	},

	mouseLeave: function() {
		this.setState( { showPopover: false } );
	},

	buildTooltipData: function() {
		const { date, postCount } = this.props;
		const count = postCount || 0;

		const labelWrapper = (
			<span>
				<span className="post-count">{
					this.translate(
						'%(posts)d post',
						'%(posts)d posts', {
							count: count,
							args: {
								posts: count
							},
							comment: 'How many posts published on a certain date.'
						}
					)
				} </span>
				<span className="date">{ date.format( 'L' ) }</span>
			</span>
		);

		return [ { label: labelWrapper } ];
	},

	render: function() {
		const { postCount, max, date, month } = this.props;
		let dayClasses = {};
		let showTooltip = false;
		let tooltip;

		// Level is calculated between 0 and 4, 4 being days where posts = max, and 0 being days where posts = 0
		let level = Math.ceil( ( postCount / max ) * 4 );

		if ( date.isBefore( i18n.moment( month ).startOf( 'month' ) ) || date.isAfter( i18n.moment( month ).endOf( 'month' ) ) ) {
			dayClasses['is-outside-month'] = true;
		} else if ( date.isAfter( i18n.moment().endOf( 'day' ) ) ) {
			dayClasses['is-after-today'] = true;
		} else if ( level ) {
			if ( level > 4 ) {
				level = 4;
			}

			dayClasses[ 'is-level-' + level ] = true;
			showTooltip = true;
			dayClasses[ 'is-hovered' ] = this.state.showPopover;
		}

		dayClasses = classNames( 'post-trends__day', dayClasses );

		if ( showTooltip ) {
			tooltip = (
				<Popover context={ this.refs && this.refs.day }
					isVisible={ this.state.showPopover }
					position="top"
					className="chart__tooltip is-streak"
					onClose={ noop }
					>
					<Tooltip data={ this.buildTooltipData() } />
				</Popover>
			);
		}

		return (
			<div className={ dayClasses }
				onMouseEnter={ this.mouseEnter }
				onMouseLeave={ this.mouseLeave }
				ref="day">
				{ tooltip }
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const query = {
		startDate: i18n.moment().subtract( 1, 'year' ).startOf( 'month' ).format( 'YYYY-MM-DD' ),
		endDate: i18n.moment().endOf( 'month' ).format( 'YYYY-MM-DD' )
	};

	return {
		postCount: getSiteStatsPostsCountByDay( state, siteId, query, ownProps.date.format( 'YYYY-MM-DD' ) ),
		max: getSiteStatsMaxPostsByDay( state, siteId, query )
	};
} )( PostTrendsDay );
