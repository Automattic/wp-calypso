/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	noop = require( 'lodash/utility/noop' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	Popover = require( 'components/popover' ),
	Tooltip = require( 'components/chart/tooltip' );

module.exports = React.createClass( {

	displayName: 'PostTrendsDay',

	propTypes: {
		days: React.PropTypes.object.isRequired,
		date: React.PropTypes.object.isRequired,
		month: React.PropTypes.object.isRequired,
		max: React.PropTypes.number.isRequired
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

	buildTooltipData: function( date, data ) {
		var tooltipData = [],
			count = 0,
			label,
			labelWrapper;

		count = data[ date.format( 'YYYY-MM-DD' ) ] || 0;

		label = this.translate(
			'%(posts)d post on',
			'%(posts)d posts on', {
				count: count,
				args: {
					posts: count
				},
				comment: 'How many posts published on a certain date.'
		} );

		labelWrapper = (
			<span>
				<span className="post-count">{ label } </span>
				<span className="date">{ date.format( 'L' ) }</span>
			</span>
		);

		tooltipData.push( {
			label: labelWrapper
		} );

		return tooltipData;
	},

	render: function() {
		var level,
			data = this.props.days,
			date = this.props.date,
			max = this.props.max,
			dayClasses = {},
			tooltip = null,
			showTooltip = false;

		// Level is calculated between 0 and 4, 4 being days where posts = max, and 0 being days where posts = 0
		level = Math.ceil( ( data[ date.format( 'YYYY-MM-DD' ) ] / max ) * 4 );

		if ( date.isBefore( i18n.moment( this.props.month ).startOf( 'month' ) ) || date.isAfter( i18n.moment( this.props.month ).endOf( 'month' ) ) ) {
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
					onClose={ noop }
					className="chart__tooltip is-streak"
					>
					<Tooltip data={ this.buildTooltipData( date, data ) } />
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
