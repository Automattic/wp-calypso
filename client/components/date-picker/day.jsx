/**
 * External Dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/noop' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Tooltip = require( 'components/tooltip' );

module.exports = React.createClass( {
	displayName: 'DatePickerDay',

	propTypes: {
		date: React.PropTypes.object.isRequired,
		events: React.PropTypes.array
	},

	getInitialState: function() {
		return {
			showTooltip: false
		};
	},

	isPastDay: function( date ) {
		var today = this.moment().set( {
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		} );

		date = date || this.props.date;

		return ( +today - 1 ) >= +date;
	},

	handleTooltip: function( show ) {
		var showTooltip = ! ! this.props.events.length && show;
		this.setState( { showTooltip: showTooltip } );
	},

	renderTooltip: function() {
		var label;

		if ( ! this.state.showTooltip ) {
			return;
		}

		label = this.translate(
				'%(posts)d post',
				'%(posts)d posts', {
					count: this.props.events.length,
					args: {
						posts: this.props.events.length
					}
				}
			);

		return (
			<Tooltip
				context={ this.refs.dayTarget }
				isVisible={ this.state.showTooltip }
				onClose={ noop }
			>
				<span>{ label }</span>
				<hr className="tooltip__hr" />
				<ul>
					{
						this.props.events.map( function( event ) {
							return <li key={ event.id }>{ event.title }</li>;
						} )
					}
				</ul>
			</Tooltip>
		);
	},

	render: function() {
		var classes = { 'date-picker__day': true },
			i = 0,
			dayEvent;

		classes[ 'is-selected' ] = this.props.selected === true;
		classes[ 'past-day' ] = this.isPastDay() === true;

		if ( this.props.events.length ) {
			classes[ 'date-picker__day_event' ] = true;

			for ( i; i < this.props.events.length; i++ ) {
				dayEvent = this.props.events[ i ];

				if ( dayEvent.type &&
					( ! classes[ 'date-picker__day_event_' + dayEvent.type ] ) ) {
					classes[ 'date-picker__day_event_' + dayEvent.type ] = true;
				}
			}
		}

		return (
			<div
				ref="dayTarget"
				className={ classNames( classes ) }
				onMouseEnter={ this.handleTooltip.bind( this, true ) }
				onMouseLeave={ this.handleTooltip.bind( this, false ) }
			>
				<span
					key={ 'selected-' + ( this.props.date.getTime() / 1000 | 0 ) }
					className="date-picker__day-selected">
				</span>
				<span className="date-picker__day-text">
					{ this.props.date.getDate() }
				</span>

				{ this.renderTooltip() }
			</div>
		);
	}
} );
