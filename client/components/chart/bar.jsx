/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:module-chart:bar' );

/**
 * Internal dependencies
 */
var	Tooltip = require( 'components/tooltip' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'ModuleChartBar',

	propTypes: {
		isTouch: React.PropTypes.bool,
		tooltipPosition: React.PropTypes.string,
		className: React.PropTypes.string,
		clickHandler: React.PropTypes.func,
		data: React.PropTypes.object.isRequired,
		max: React.PropTypes.number,
		count: React.PropTypes.number
	},

	getInitialState: function() {
		return { showPopover: false };
	},

	buildSections: function() {
		var value = this.props.data.value,
			max = this.props.max,
			percentage = max ? Math.ceil( ( value / max ) * 10000 ) / 100 : 0,
			remain = 100 - percentage,
			remainFloor = Math.max( 1, Math.floor( remain ) ),
			sections = [],
			remainStyle,
			valueStyle,
			nestedValue = this.props.data.nestedValue,
			nestedBar,
			nestedPercentage,
			nestedStyle,
			spacerClassOptions = {
				'chart__bar-section': true,
				'is-spacer': true,
				'is-ghost': ( 100 === remain ) && ! this.props.active
			};

		remainStyle = {
			height: remainFloor + '%'
		};

		sections.push( <div key="spacer" className={ classNames( spacerClassOptions ) } style={ remainStyle } /> );

		valueStyle = {
			top: remainFloor + '%'
		};

		if ( nestedValue ) {
			nestedPercentage = value ? Math.ceil( ( nestedValue / value ) * 10000 ) / 100 : 0;

			nestedStyle = { height: nestedPercentage + '%' };

			nestedBar = ( <div key="nestedValue" className="chart__bar-section-inner" style={ nestedStyle } /> );
		}

		sections.push( <div ref="valueBar" key="value" className="chart__bar-section is-bar" style={ valueStyle }>{ nestedBar }</div> );

		sections.push( <div key="label" className="chart__bar-label">{ this.props.label }</div> );

		return sections;
	},

	clickHandler: function(){
		if ( 'function' === typeof( this.props.clickHandler ) ) {
			this.props.clickHandler( this.props.data );
		}
	},


	mouseEnter: function(){
		this.setState( { showPopover: true } );
	},

	mouseLeave: function() {
		this.setState( { showPopover: false } );
	},

	renderTooltip() {
		if (
			! this.props.data.tooltipData ||
			! this.props.data.tooltipData.length ||
			this.props.isTouch
		) {
			return null;
		}

		const { tooltipData } = this.props.data;

		const listItemElements = tooltipData.map( function( options, i ) {
			var wrapperClasses = [ 'module-content-list-item' ],
				gridiconSpan;

			if ( options.icon ) {
				gridiconSpan = ( <Gridicon icon={ options.icon } size={ 18 } /> );
			}

			wrapperClasses.push( options.className );

			return (
				<li key={ i } className={ wrapperClasses.join( ' ' ) } >
					<span className='wrapper'>
						<span className='value'>{ options.value }</span>
						<span className='label'>{ gridiconSpan }{ options.label }</span>
					</span>
				</li>
			);
		} );

		return (
			<Tooltip
				className="chart__tooltip"
				id="popover__chart-bar"
				showDelay={ 200 }
				context={ this.refs && this.refs.valueBar }
				isVisible={ this.state.showPopover }
				position={ this.props.tooltipPosition }
			>
				<ul>
					{ listItemElements }
				</ul>
			</Tooltip>
		);
	},

	render: function() {
		debug( 'Rendering bar', this.state );

		var barStyle,
			barClass,
			count = this.props.count || 1;

		barClass = { chart__bar: true };

		if ( this.props.className ){
			barClass[ this.props.className ] = true;
		}

		barStyle = {
			width: ( ( 1 / count ) * 100 ) + '%'
		};

		return (
			<div onClick={ this.clickHandler }
				 onMouseEnter={ this.mouseEnter }
				 onMouseLeave={ this.mouseLeave }
				 className={ classNames( barClass ) }
				 style={ barStyle }>
				{ this.buildSections() }
				<div className="chart__bar-marker is-hundred"></div>
				<div className="chart__bar-marker is-fifty"></div>
				<div className="chart__bar-marker is-zero"></div>
				{ this.renderTooltip() }
			</div>
		);
	}
} );
